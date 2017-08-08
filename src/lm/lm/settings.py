"""
Django settings for lm project.

Generated by 'django-admin startproject' using Django 1.11.2.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""

import os

LIFTED_TEMP_USERNAME = 'lifted'
LIFTED_TEMP_PASSWORD = '***REMOVED***'

LIFTED_TEMP_SUPER_USERNAME = 'weijie'
LIFTED_TEMP_SUPER_PASSWORD = 'uCZN3xocaSWHXTEGNDFhVWbZB7NicYLfYnjvGicuMTUYALxF7uc99pbo9QNAjGvpb7NhR3aMY5T8wUMGyHYaQgbVFitn4hGeM2HM'

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Redirect here after /login
LOGIN_REDIRECT_URL = '/'

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.11/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECURITY WARNING: don't run with debug turned on in production!
SECRET_KEY = 'G-:Gglp?"ayxKD(urwBxbmd%,.PfiF9Ark.cw#iIc#*H$&J\<l9yV]|1"Z6[z}/'
DEBUG = False

if 'DEV' in os.environ:
    SECRET_KEY = 'kw!3bqy4e39x0@xhoor4uvpwj!hgofxh9p5=j7^9$x-i*41vc_'
    DEBUG = True

elif 'DJANGO_SECRET_KEY' in os.environ:
    # if DJANGO_SECRET_KEY is set in ENV, then assume it's a production server
    SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
    DEBUG = False


print("Debug set to", str(DEBUG))

ALLOWED_HOSTS = ["*"]

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'htmlmin.middleware.HtmlMinifyMiddleware',
    'htmlmin.middleware.MarkRequestMiddleware',
]

ROOT_URLCONF = 'lm.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lm.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases

DATABASES = None

if 'DEV' in os.environ:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'liftedmobile',
            'USER': 'postgres',
            'PASSWORD': os.environ['DB_PWD'],
            'HOST': 'liftedmobile_db_dev',
            'PORT': '5432',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'liftedmobile',
            'USER': 'postgres',
            'PASSWORD': os.environ['DB_PWD'],
            'HOST': 'liftedmobile_db',
            'PORT': '5432',
        }
    }

# Password hashing
# https://docs.djangoproject.com/en/1.11/topics/auth/passwords/#using-argon2-with-django

PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
]

# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static/")
