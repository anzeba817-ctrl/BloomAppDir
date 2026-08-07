from cryptography.fernet import Fernet


class CryptoService:
    def __init__(self, key: str) -> None:
        self._fernet = Fernet(key.encode("utf-8"))

    def encrypt(self, raw: str | None) -> str | None:
        if raw is None:
            return None
        return self._fernet.encrypt(raw.encode("utf-8")).decode("utf-8")

    def decrypt(self, token: str | None) -> str | None:
        if token is None:
            return None
        return self._fernet.decrypt(token.encode("utf-8")).decode("utf-8")
