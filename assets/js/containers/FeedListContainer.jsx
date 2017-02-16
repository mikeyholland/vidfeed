import React from 'react';

import FeedItemContainer from '../containers/FeedItemContainer';

const FeedListContainer = React.createClass({

    getInitialState: function() {
        return {
            feeds:[],
            moveMode:false,
            firstFeedSelected:undefined,
            selectedCount:0
        };
    },


    componentDidMount: function() {
        this._loadFeedsFromServer(this.props.projectId);
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.cancelMove != this.state.moveMode) {
            this.setState({
                moveMode:nextProps.cancelMove,
                selectedCount:0
            });
        }
        if (nextProps.projectId != this.props.projectId) {
            this._loadFeedsFromServer(nextProps.projectId);
        }
    },

    _loadFeedsFromServer: function(projectId) {
        let feedPath;
        if (projectId != 0) {
            feedPath = '/api/projects/' + projectId + '/feeds';
        } else {
            feedPath = '/api/feeds/'
        }
        $.ajax({
            url: feedPath,
            success: function(data) {
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

    _toggleMoveMode:function(bool, feedId){
        this.setState({
            moveMode:bool,
            firstFeedSelected:feedId
        }, function(){
            this.props.moveMode(this.state.moveMode);
        });
    },

    _selectedCount:function(bool) {
        this.setState({
            firstFeedSelected:undefined
        });
        if (bool) {
            this.setState({
                selectedCount:this.state.selectedCount+1
            }, function(){
                this.props.selectedCount(this.state.selectedCount);
            });
        } else {
            this.setState({
                selectedCount:this.state.selectedCount-1
            }, function(){
                this.props.selectedCount(this.state.selectedCount);
            });
        }
    },

    render: function() {

        var feedNodes = this.state.feeds.map(function(feed, i) {
            if (feed.provider.name === 'vimeo') {
                var isVimeo = true;
            } else {
                var isVimeo = false;
            }
            return (
                <FeedItemContainer
                    key={i}
                    created={feed.created}
                    feedId={feed.feed_id}
                    isVimeo={isVimeo}
                    videoTitle={feed.video_title} 
                    videoThumb={feed.video_thumbnail}
                    modalOpen={this.props.modalOpen}
                    modalClose={this.props.modalClose}
                    moveMode={this.state.moveMode}
                    setMoveMode={this._toggleMoveMode}
                    firstFeedSelected={this.state.firstFeedSelected}
                    selectedCount={this._selectedCount} />
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