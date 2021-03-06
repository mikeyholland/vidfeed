from __future__ import absolute_import

from .base import *

WEBPACK_LOADER = {
    'DEFAULT': {
        'BUNDLE_DIR_NAME': 'dist/',
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats-prod.json'),
    }
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'vidfeed_master',
        'USER': 'vidfeed_live',
        'PASSWORD': 'Hti5ExjnbDpgpDd',
        'HOST': '127.0.0.1',
        'PORT': '5432',
    },
    # 'from_db': {
    #     'ENGINE': 'django.db.backends.postgresql_psycopg2',
    #     'NAME': 'vidfeed_live',
    #     'USER': 'vidfeed',
    #     'PASSWORD': 'ajJ5USVZ9DVdbQe',
    #     'HOST': '127.0.0.1',
    #     'PORT': '5432',
    # }

}


########## SITE SETTINGS
YOUTUBE_API_KEY = 'AIzaSyDvSM-xqZ_P2g2asg7DO-0z1R4CL9d8OXA'
COOKIE_DOMAIN = 'vidfeed.io'
BASE_URL = 'https://vidfeed.io'
########## END SITE SETTINGS

VIMEO_CLIENT_IDENTIFIED = 'a98558c1e2e7cb7a13dc04867410300c73719abe'
VIMEO_CLIENT_SECRET = 'XKGzeVqYhyfT2moRXzdykpzlzylzVR4ujrWSaSnVvn7Pe4IYBmsD9tPMe7nFlrrAuq0nQrMEvjXGk1+akPndqcOucoo6xle/FF4qrn//ms9keC9A9lWV7bzKFOtZfG1y'
