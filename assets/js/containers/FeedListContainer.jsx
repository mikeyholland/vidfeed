import React from 'react';

import FeedListItem from '../components/FeedListItem';

const FeedListContainer = React.createClass({

    getInitialState: function() {
        return {
            feeds:[],
            tallestInfo:undefined
        };
    },

    componentDidMount: function() {
        this._loadFeedsFromServer();    
    },

    _loadFeedsFromServer: function() {
        $.ajax({
            url: '/api/feeds/',
            dataType: 'json',
            cache: false,
            success: function(data) {
                for (var i = data.length-1; i >= 0; i--) {
                    if (!data[i].owner) {
                        data.splice(i, 1);
                    }
                    if (data[i].owner.email != window.vidfeed.user.email) {
                        data.splice(i, 1);
                    }
                }
                data.sort(function(a,b){
                    return new Date(b.created) - new Date(a.created);
                });
                this.setState({
                    feeds: data
                });
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(status, err.toString());
            }.bind(this)
        });
    },

    render: function() {

        var feedNodes = this.state.feeds.map(function(feed, i) {
            if (feed.provider.name === 'vimeo') {
                var isVimeo = true;
            } else {
                var isVimeo = false;
            }
            return (
                <FeedListItem
                    key={i}
                    created={feed.created}
                    feedId={feed.feed_id}
                    isVimeo={isVimeo}
                    videoTitle={feed.video_title} 
                    videoThumb={feed.video_thumbnail} />
            );
        }.bind(this));

        return (
            <section className="o-layout">
                {feedNodes}
            </section>
        );
    }

});

module.exports = FeedListContainer;