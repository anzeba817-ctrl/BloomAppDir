from typing import Any

class HTTPAuthorizationCredentials:
    credentials: str

class HTTPBearer:
    def __init__(self, auto_error: bool = ...) -> None: ...
    def __call__(self, *args: Any, **kwargs: Any) -> Any: ...
