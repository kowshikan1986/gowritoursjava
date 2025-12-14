from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.exceptions import ParseError


@csrf_exempt  # Simplifies SPA login; consider CSRF protection for production
@api_view(['POST'])
@parser_classes([JSONParser, FormParser, MultiPartParser])
@permission_classes([AllowAny])
def login_view(request):
    try:
        data = request.data
    except ParseError:
        # Fallback for malformed JSON: try form data or raw body decode
        data = request.POST

    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return Response({'detail': 'Username and password required'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=username, password=password)
    if not user or not user.is_staff:
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

    login(request, user)
    response = Response({'username': user.username, 'is_staff': user.is_staff})
    # Ensure CSRF cookie is set for subsequent session-authenticated requests
    response.set_cookie(
        'csrftoken',
        get_token(request),
        httponly=False,
        samesite='Lax',
    )
    return response


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    return Response({'username': user.username, 'is_staff': user.is_staff})
from django.shortcuts import render

# Create your views here.
