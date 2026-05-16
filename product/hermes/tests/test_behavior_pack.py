import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.model.behavior_pack import build_manifest, sign_manifest, verify_signature


def test_build_manifest():
    manifest = build_manifest(version="1.0.0", target_bastion_type="ground")
    assert manifest["version"] == "1.0.0"
    assert manifest["target_bastion_type"] == "ground"
    assert manifest["signature_algorithm"] == "Ed25519"
    assert manifest["checksum"]["algorithm"] == "SHA-256"
    assert len(manifest["checksum"]["value"]) == 64
    assert manifest["contents"]["models"] == []


def test_sign_and_verify():
    manifest = build_manifest()
    sig = sign_manifest(manifest)
    assert sig["algorithm"] == "Ed25519"
    assert len(sig["signature"]) > 0
    assert verify_signature(manifest, sig) is True


def test_tampered_manifest_fails():
    manifest = build_manifest()
    sig = sign_manifest(manifest)
    tampered = {**manifest, "version": "9.9.9"}
    assert verify_signature(tampered, sig) is False


if __name__ == "__main__":
    test_build_manifest()
    test_sign_and_verify()
    test_tampered_manifest_fails()
    print("All behavior pack tests passed.")
