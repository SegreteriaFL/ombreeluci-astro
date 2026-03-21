#!/usr/bin/env python3
"""
Setup VPS Hetzner per Directus — streaming SSH con paramiko.
"""
import sys
import time
import select
import paramiko

# Fix encoding Windows
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
sys.stderr.reconfigure(encoding="utf-8", errors="replace")

HOST = "159.69.196.64"
USER = "root"
PASS = "adjao83Aa903f9a"
PORT = 22


def connect():
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, PORT, USER, PASS, timeout=30)
    return client


def run(client, cmd, timeout=600, ignore_error=False, quiet=False):
    """Esegui comando SSH con streaming output riga per riga."""
    if not quiet:
        print(f"\n>>> {cmd[:120]}")
    sys.stdout.flush()

    transport = client.get_transport()
    chan = transport.open_session()
    chan.get_pty(width=220)
    chan.exec_command(cmd)

    buf = b""
    output_lines = []
    deadline = time.time() + timeout

    while True:
        if time.time() > deadline:
            print(f"[TIMEOUT dopo {timeout}s]")
            break
        ready = select.select([chan], [], [], 1.0)[0]
        if ready:
            chunk = chan.recv(4096)
            if not chunk:
                break
            buf += chunk
            # Stampa righe complete
            while b"\n" in buf or b"\r" in buf:
                nl = buf.find(b"\n")
                cr = buf.find(b"\r")
                pos = min(p for p in [nl, cr] if p >= 0)
                line_bytes = buf[:pos]
                buf = buf[pos+1:]
                line = line_bytes.decode("utf-8", errors="replace").rstrip()
                if line and not quiet:
                    print(line)
                    sys.stdout.flush()
                if line:
                    output_lines.append(line)
        elif chan.exit_status_ready():
            # Drena eventuali residui
            while chan.recv_ready():
                chunk = chan.recv(4096)
                if chunk:
                    buf += chunk
            break

    # Svuota buffer finale
    if buf:
        line = buf.decode("utf-8", errors="replace").rstrip()
        if line and not quiet:
            print(line)
            sys.stdout.flush()
        if line:
            output_lines.append(line)

    rc = chan.recv_exit_status()
    chan.close()

    if rc != 0 and not ignore_error and not quiet:
        print(f"[exit code {rc}]")

    return "\n".join(output_lines), "", rc


def run_input(client, cmd, input_text, timeout=30):
    """Esegui comando che richiede input (es. ufw enable)."""
    transport = client.get_transport()
    chan = transport.open_session()
    chan.get_pty()
    chan.exec_command(cmd)
    time.sleep(1)
    chan.send(input_text.encode())
    time.sleep(1)
    out = b""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if chan.recv_ready():
            out += chan.recv(4096)
        elif chan.exit_status_ready():
            break
        else:
            time.sleep(0.5)
    rc = chan.recv_exit_status()
    chan.close()
    result = out.decode("utf-8", errors="replace").strip()
    print(f">>> {cmd}")
    print(result)
    return result, "", rc


def main():
    print(f"Connessione a {HOST}...")
    ssh = connect()
    print("Connesso.\n")

    # ── STEP 1: Sicurezza base ────────────────────────────────────────────────
    print("=" * 60)
    print("STEP 1 — Sicurezza base")
    print("=" * 60)

    # apt update
    run(ssh, "DEBIAN_FRONTEND=noninteractive apt update -qq", timeout=120)
    # apt upgrade (potrebbe essere lungo)
    run(ssh, "DEBIAN_FRONTEND=noninteractive apt upgrade -y -qq", timeout=600)
    run(ssh, "DEBIAN_FRONTEND=noninteractive apt install -y fail2ban ufw", timeout=120)

    # UFW
    run(ssh, "ufw --force reset", ignore_error=True, quiet=True)
    run(ssh, "ufw default deny incoming", quiet=True)
    run(ssh, "ufw default allow outgoing", quiet=True)
    run(ssh, "ufw allow 22/tcp comment 'SSH'", quiet=True)
    run(ssh, "ufw allow 80/tcp comment 'HTTP'", quiet=True)
    run(ssh, "ufw allow 443/tcp comment 'HTTPS'", quiet=True)
    run(ssh, "ufw allow 8055/tcp comment 'Directus'", quiet=True)
    run(ssh, "ufw --force enable")
    run(ssh, "ufw status verbose")
    run(ssh, "systemctl enable fail2ban && systemctl start fail2ban", quiet=True)
    print(">> Step 1 OK")

    # ── STEP 2: Docker ────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("STEP 2 — Docker + Docker Compose")
    print("=" * 60)

    run(ssh, "DEBIAN_FRONTEND=noninteractive apt install -y ca-certificates curl gnupg", timeout=120)
    run(ssh, "install -m 0755 -d /etc/apt/keyrings")
    run(ssh, "curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc && chmod a+r /etc/apt/keyrings/docker.asc")
    run(ssh, 'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null')
    run(ssh, "apt update -qq", timeout=60)
    run(ssh, "DEBIAN_FRONTEND=noninteractive apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin", timeout=300)
    run(ssh, "systemctl enable docker && systemctl start docker")
    run(ssh, "docker --version && docker compose version")
    print(">> Step 2 OK")

    # ── STEP 3+4: Struttura + docker-compose.yml ─────────────────────────────
    print("\n" + "=" * 60)
    print("STEP 3+4 — docker-compose.yml con password generate")
    print("=" * 60)

    run(ssh, "mkdir -p /opt/oel-cms")

    # Genera password sul server
    out_db, _, _  = run(ssh, "openssl rand -hex 16", quiet=True)
    out_adm, _, _ = run(ssh, "openssl rand -hex 16", quiet=True)
    out_sec, _, _ = run(ssh, "openssl rand -hex 32", quiet=True)

    DB_PASS    = out_db.strip().split("\n")[-1].strip()
    ADMIN_PASS = out_adm.strip().split("\n")[-1].strip()
    SECRET     = out_sec.strip().split("\n")[-1].strip()

    # Scrive il compose tramite python3 sul server (evita problemi di quoting bash)
    compose_content = f"""services:
  database:
    image: postgres:16-alpine
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: directus
      POSTGRES_USER: directus
      POSTGRES_PASSWORD: "{DB_PASS}"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U directus"]
      interval: 10s
      timeout: 5s
      retries: 5

  directus:
    image: directus/directus:latest
    restart: unless-stopped
    ports:
      - "8055:8055"
    depends_on:
      database:
        condition: service_healthy
    environment:
      SECRET: "{SECRET}"
      DB_CLIENT: pg
      DB_HOST: database
      DB_PORT: 5432
      DB_DATABASE: directus
      DB_USER: directus
      DB_PASSWORD: "{DB_PASS}"
      ADMIN_EMAIL: "info@fedeeluce.it"
      ADMIN_PASSWORD: "{ADMIN_PASS}"
      PUBLIC_URL: "http://159.69.196.64:8055"
      STORAGE_LOCATIONS: local
      STORAGE_LOCAL_ROOT: /directus/uploads
      TELEMETRY: "false"
    volumes:
      - directus_uploads:/directus/uploads
      - directus_extensions:/directus/extensions

volumes:
  postgres_data:
  directus_uploads:
  directus_extensions:
"""

    env_content = f"""# /opt/oel-cms/.env.local — NON committare
POSTGRES_PASSWORD={DB_PASS}
DIRECTUS_ADMIN_PASSWORD={ADMIN_PASS}
DIRECTUS_SECRET={SECRET}
ADMIN_EMAIL=info@fedeeluce.it
PUBLIC_URL=http://159.69.196.64:8055
"""

    # Scrive i file via python3 inline sul server
    py_write = f"""python3 -c "
import base64, os
compose = base64.b64decode('{__import__("base64").b64encode(compose_content.encode()).decode()}').decode()
env     = base64.b64decode('{__import__("base64").b64encode(env_content.encode()).decode()}').decode()
open('/opt/oel-cms/docker-compose.yml','w').write(compose)
open('/opt/oel-cms/.env.local','w').write(env)
os.chmod('/opt/oel-cms/.env.local', 0o600)
print('Files written OK')
"
"""
    # Calcola b64 lato locale
    import base64
    compose_b64 = base64.b64encode(compose_content.encode()).decode()
    env_b64     = base64.b64encode(env_content.encode()).decode()

    run(ssh, f"""python3 -c "
import base64, os
compose = base64.b64decode('{compose_b64}').decode()
env = base64.b64decode('{env_b64}').decode()
open('/opt/oel-cms/docker-compose.yml','w').write(compose)
open('/opt/oel-cms/.env.local','w').write(env)
os.chmod('/opt/oel-cms/.env.local', 0o600)
print('Files written OK')
"
""")

    run(ssh, "cat /opt/oel-cms/docker-compose.yml")

    # ── STEP 5: Avvia container ───────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("STEP 5 — Avvio container")
    print("=" * 60)

    run(ssh, "cd /opt/oel-cms && docker compose pull", timeout=300)
    run(ssh, "cd /opt/oel-cms && docker compose up -d", timeout=120)
    print("Attendo 90 secondi per inizializzazione Directus...")
    time.sleep(90)
    run(ssh, "cd /opt/oel-cms && docker compose ps")
    run(ssh, "cd /opt/oel-cms && docker compose logs directus --tail=60")

    # ── STEP 6: Verifica health ───────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("STEP 6 — Verifica health")
    print("=" * 60)

    out, _, rc = run(ssh, "curl -s http://127.0.0.1:8055/server/health")
    if "ok" in out.lower():
        print(">> DIRECTUS ONLINE")
    else:
        print(">> Risposta inaspettata — controlla log sopra")

    # ── STEP 7: pgvector ─────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("STEP 7 — pgvector")
    print("=" * 60)

    out_cname, _, _ = run(ssh, "docker ps --format '{{.Names}}' | grep database | head -1")
    pg_container = out_cname.strip().split("\n")[-1].strip()
    if not pg_container:
        pg_container = "oel-cms-database-1"
    print(f"Container postgres: {pg_container}")

    run(ssh, f"docker exec {pg_container} sh -c 'apt-get update -qq && apt-get install -y postgresql-16-pgvector 2>&1'", timeout=300)
    run(ssh, f'docker exec {pg_container} psql -U directus -c "CREATE EXTENSION IF NOT EXISTS vector;"')
    out_dx, _, _ = run(ssh, f'docker exec {pg_container} psql -U directus -c "\\dx"')
    if "vector" in out_dx.lower():
        print(">> pgvector INSTALLATO E ATTIVO")
    else:
        print(">> pgvector: non confermato — verifica manuale")

    # ── Riepilogo ─────────────────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("RIEPILOGO FINALE")
    print("=" * 60)
    print(f"URL Directus:    http://159.69.196.64:8055")
    print(f"Admin email:     info@fedeeluce.it")
    print(f"Admin password:  {ADMIN_PASS}")
    print(f"DB password:     {DB_PASS}")
    print(f"Secret (64):     {SECRET}")
    print(f"Credenziali su server: /opt/oel-cms/.env.local (chmod 600)")

    run(ssh, "cd /opt/oel-cms && docker compose ps")
    ssh.close()
    print("\nDone.")

    # Salva credenziali localmente
    creds = f"""# Credenziali VPS OEL — Directus
# Generato: 2026-03-20 — NON committare
HOST={HOST}
ADMIN_EMAIL=info@fedeeluce.it
ADMIN_PASSWORD={ADMIN_PASS}
DB_PASSWORD={DB_PASS}
SECRET={SECRET}
URL=http://159.69.196.64:8055
"""
    with open("vps_credentials.txt", "w") as f:
        f.write(creds)
    print("Credenziali salvate anche in: vps_credentials.txt (NON committare)")


if __name__ == "__main__":
    main()
