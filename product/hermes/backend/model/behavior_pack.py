import hashlib
import json
import uuid
import datetime
from pathlib import Path

from nacl.signing import SigningKey

from backend.config import DATA_DIR


def _get_key_path() -> Path:
    keys_dir = DATA_DIR / "keys"
    keys_dir.mkdir(parents=True, exist_ok=True)
    return keys_dir / "ed25519.key"


def get_or_create_signing_key() -> SigningKey:
    key_path = _get_key_path()
    if key_path.exists():
        return SigningKey(key_path.read_bytes())
    key = SigningKey.generate()
    key_path.write_bytes(bytes(key))
    return key


def build_manifest(
    pack_id: str | None = None,
    version: str = "0.1.0",
    target_bastion_type: str = "ground",
    target_bastion_id: str | None = None,
    contents: dict | None = None,
) -> dict:
    now = datetime.datetime.utcnow().isoformat() + "Z"
    pack_id = pack_id or str(uuid.uuid4())

    if contents is None:
        contents = {
            "models": [],
            "pipelines": [],
            "control_laws": [],
            "safety_rules": [],
            "schedules": [],
            "fallback": [],
        }

    manifest = {
        "id": pack_id,
        "version": version,
        "target_bastion_type": target_bastion_type,
        "target_bastion_id": target_bastion_id,
        "created_at": now,
        "created_by": "hermes-local",
        "signature_algorithm": "Ed25519",
        "dependencies": [],
        "contents": contents,
        "checksum": {"algorithm": "SHA-256", "value": ""},
    }

    digest = hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest()
    manifest["checksum"]["value"] = digest

    return manifest


def sign_manifest(manifest: dict) -> dict:
    key = get_or_create_signing_key()
    verify_key = key.verify_key

    digest = hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).digest()
    signed = key.sign(digest)

    pubkey_fp = hashlib.sha256(bytes(verify_key)).hexdigest()[:16]

    return {
        "algorithm": "Ed25519",
        "public_key_fingerprint": pubkey_fp,
        "signature": signed.signature.hex(),
        "signed_digest": {
            "algorithm": "SHA-256",
            "excludes": ["signature"],
        },
    }


def verify_signature(manifest: dict, signature_data: dict) -> bool:
    key = get_or_create_signing_key()
    verify_key = key.verify_key

    digest = hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).digest()
    sig_bytes = bytes.fromhex(signature_data["signature"])

    try:
        verify_key.verify(digest, sig_bytes)
        return True
    except Exception:
        return False
