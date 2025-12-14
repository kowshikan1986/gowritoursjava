from rest_framework.authentication import SessionAuthentication


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    Session auth without CSRF enforcement (use only for API where you've already
    gated by permissions or other controls). Suitable for dev/local SPA use.
    """

    def enforce_csrf(self, request):
        return

