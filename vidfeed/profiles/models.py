from __future__ import unicode_literals

from django.db import models, IntegrityError
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _
from oauth2client.contrib.django_util.models import CredentialsField


class SiteUserManager(BaseUserManager):
    def _create_user(self, email, password, **extra_fields):
        """
        Creates and saves a User with the given username, email and password.
        """
        now = timezone.now()
        email = self.normalize_email(email)
        user = self.model(email=email, date_joined=now, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def find_or_create_user(self, email):
        users = self.filter(email__iexact=email)
        if users:
            return users[0]
        return self.create_user(email=email.lower())

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)

    def register_user(self, email, first_name, last_name, password):
        existing_user = self.filter(email__iexact=email)
        if existing_user and existing_user[0].is_active:
            raise IntegrityError('Email address already registered')
        elif existing_user:
            user = existing_user[0]
            user.first_name = first_name
            user.last_name = last_name
            user.is_active = True
            user.set_password(password)
            user.save()
        else:
            user = self.create_user(email=email, password=password,
                                    first_name=first_name, last_name=last_name)
            user.is_active = True
            user.save()
        return user


# Create your models here.
class SiteUser(AbstractBaseUser, PermissionsMixin):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    email = models.EmailField(_('email address'), unique=True, blank=True)
    first_name = models.CharField(_('first name'), max_length=30, blank=True)
    last_name = models.CharField(_('last name'), max_length=30, blank=True)
    is_staff = models.BooleanField(
        _('staff status'),
        default=False,
        help_text=_('Designates whether the user can log into this admin site.'),
    )
    is_active = models.BooleanField(
        _('active'),
        default=False,
        help_text=_(
            'Designates whether this user should be treated as active. '
            'Unselect this instead of deleting accounts.'
        ),
    )
    date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

    objects = SiteUserManager()

    def get_display_name(self):
        if self.get_full_name():
            return self.get_full_name()
        return self.email.split('@')[0]

    def get_full_name(self):
        """
        Returns the first_name plus the last_name, with a space in between.
        """
        full_name = '%s %s' % (self.first_name, self.last_name)
        return full_name.strip()

    def get_short_name(self):
        "Returns the short name for the user."
        return self.first_name

    def get_subscription(self):
        try:
            return Subscription.objects.get(user=self)
        except Subscription.DoesNotExist:
            return False

    def has_linked_vimeo_account(self):
        s = self.get_subscription()
        if s and s.vimeo_token:
            return True
        return False

    def has_linked_youtube_account(self):
        s = self.get_subscription()
        if s and s.youtube_credentials:
            return True
        return False


class Subscription(models.Model):
    SUBSCRIPTION_MONTHLY = 1
    SUBSCRIPTION_YEARLY = 2
    SUBSCRIPTION_TYPE = (
        (SUBSCRIPTION_MONTHLY, 'Monthly'),
        (SUBSCRIPTION_YEARLY, 'Yearly'),
    )
    user = models.OneToOneField(SiteUser)
    subscription_type = models.SmallIntegerField(choices=SUBSCRIPTION_TYPE)
    active = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    vimeo_token = models.CharField(max_length=500, blank=True, null=True)
    vimeo_scope = models.CharField(max_length=500, blank=True, null=True)
    youtube_credentials = CredentialsField(blank=True, null=True)

