from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import detail_route

from vidfeed.profiles.models import SiteUser
from vidfeed.feed.models import Comment, Feed, Provider
from vidfeed.utils import get_youtube_title_and_thumbnail, get_vimeo_title_and_thumbnail, \
    set_vidfeed_user_cookie
from serializers import CommentSerializer, FeedSerializer


class CommentList(APIView):
    def get_objects(self, feed_id):
        feed = get_object_or_404(Feed, feed_id=feed_id)
        return Comment.objects.filter(feed=feed, deleted=False,
                                      parent_comment__isnull=True)

    def get(self, request, feed_id, format=None):
        serializer = CommentSerializer(self.get_objects(feed_id), many=True)
        return Response(serializer.data)

    def post(self, request, feed_id, format=None):
        feed = get_object_or_404(Feed, feed_id=feed_id)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save(feed=feed)
            except Comment.DoesNotExist:
                return Response({"message": "Invalid parent comment"},
                                status=status.HTTP_400_BAD_REQUEST)
            owner_email = serializer.data.get('owner').get('email')
            r = Response(serializer.data, status=status.HTTP_201_CREATED)
            set_vidfeed_user_cookie(r, owner_email)
            return r
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CommentDetail(APIView):
    def get_object(self, feed_id, pk):
        return get_object_or_404(Comment, feed__feed_id=feed_id, pk=pk)

    def put(self, request, feed_id, comment_id, format=None):
        comment = self.get_object(feed_id, comment_id)
        serializer = CommentSerializer(comment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, feed_id, comment_id, format=None):
        comment = self.get_object(feed_id, comment_id)
        comment.deleted = True
        comment.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FeedList(APIView):
    def get(self, request, format=None):
        feeds = Feed.objects.all()
        serializer = FeedSerializer(feeds, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        feedUrl = request.POST.get('videoUrl')
        if not feedUrl:
            return Response({"message": "Please enter a valid Url"}, status=status.HTTP_400_BAD_REQUEST)
        provider, video_id, has_password = Provider.find_valid_provider(feedUrl)
        if not provider:
            return Response({"message": "Please enter a valid Url"}, status=status.HTTP_400_BAD_REQUEST)
        title, thumb = '', ''
        if provider.name == 'youtube':
            title, thumb = get_youtube_title_and_thumbnail(video_id)
        elif provider.name == 'vimeo':
            title, thumb = get_vimeo_title_and_thumbnail(video_id)

        feed = Feed.objects.create(feed_id=Feed.generate_link_id(),
                                   provider=provider,
                                   video_id=video_id,
                                   active=True,
                                   video_title=title,
                                   video_thumbnail=thumb)
        return Response(FeedSerializer(instance=feed).data)


class FeedDetail(viewsets.GenericViewSet):

    def get_object(self, feed_id):
        return get_object_or_404(Feed, feed_id=feed_id)

    def get(self, request, feed_id, format=None):
        feed = self.get_object(feed_id)
        serializer = FeedSerializer(feed)
        return Response(serializer.data)

    @detail_route(methods=['post'])
    def set_owner(self, request, feed_id):
        feed = self.get_object(feed_id)
        owner = request.POST.get('owner')
        if feed.owner is not None:
            return Response({"message": "Cannot overwrite owner"}, status=status.HTTP_403_FORBIDDEN)
        if not owner:
            return Response({"message": "Please enter a valid email"}, status=status.HTTP_400_BAD_REQUEST)
        feed.owner = SiteUser.objects.find_or_create_user(owner)
        feed.save()
        r = Response(FeedSerializer(instance=feed).data)
        set_vidfeed_user_cookie(r, feed.owner.email)
        return r

