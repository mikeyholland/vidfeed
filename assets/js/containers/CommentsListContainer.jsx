import React from 'react';

import CommentContainer from './CommentContainer';

const CommentsListContainer = React.createClass({
    
    propTypes: {
        pollInterval:           React.PropTypes.number.isRequired,
        windowHeight:           React.PropTypes.number,
        feedId:                 React.PropTypes.string.isRequired,
        modalOpen:              React.PropTypes.func.isRequired,
        modalClose:             React.PropTypes.func.isRequired,
        timecodeClick:          React.PropTypes.func.isRequired,
        replyToOpen:            React.PropTypes.number
    },

    getInitialState: function() {
        return {
            data: [],
            commentListHeight:'',
            closeReplies:false
        };
    },

    componentDidMount: function() {
        this._loadCommentsFromServer();
        this.commentsInterval = setInterval(this._loadCommentsFromServer, this.props.pollInterval);
    },

    componentWillUnmount: function() {
        clearInterval(this.commentsInterval);
    },

    _setCommentsHeight: function() {
        this.setState({
            commentListHeight:''
        });
        var commentListSpace = this.props.windowHeight - this.refs.commentCount.clientHeight;
        if (this.refs.commentList.clientHeight > commentListSpace) {
            this.setState({
                commentListHeight:commentListSpace
            });
        }
    },

    _closeReplies:function(id) {
        this.setState({
            replyToOpen:id,
            closeReplies:true
        });
    },

    _loadCommentsFromServer: function() {
        $.ajax({
            url: '/api/feeds/' + this.props.feedId + '/comments',
            dataType: 'json',
            cache: false,
            success: function(data) {
                data.sort(function(a, b) {
                    return parseFloat(a.timecode) - parseFloat(b.timecode);
                });
                this.setState({
                    data: data
                });
                this._setCommentsHeight();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.feedId, status, err.toString());
            }.bind(this)
        });
    },

    _handleCommentEdit: function(commentId, author, text){
        $.ajax({
            url: '/api/feeds/' + this.props.feedId + '/comments/' + commentId,
            dataType: 'json',
            context: this,
            type: 'PUT',
            data: {body: text, author: author},
            success: function() {
                this._loadCommentsFromServer();
            }
        });
    },

    _handleDeleteComment: function (commentId) {
        $.ajax({
            url: '/api/feeds/' + this.props.feedId + '/comments/' + commentId,
            dataType: 'json',
            context: this,
            type: 'DELETE',
            success: function() {
                this._loadCommentsFromServer();
            }
        });
    },

    _handleLockClick: function (commentId, lockState) {
        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/api/feeds/' + this.props.feedId + '/comments/' + commentId + '/set-done',
            data: {
                done: lockState
            },
            success: function (data) {
                
            }
        });
    },

    _scrollToComment: function(commentId) {
        var newComment = $('.c-comment[data-id='+commentId+']').closest('.c-comment__outer');
        var commentHeight = $(newComment).outerHeight();
        var commentList = this.refs.commentList;
        $(commentList).animate({
            scrollTop: $(commentList).scrollTop() + $(newComment).position().top - $(commentList).height()/2 + commentHeight/2
        },500);
    },

    render: function() {
        var noComments = <div className="c-commentList__no-comments">No comments yet <span className="nowrap">:(</span><br />Be the first!</div>;
        var commentNodes = this.state.data.map(function(comment) {
            return (
                <CommentContainer 
                    feedId = {this.props.feedId}
                    author={comment.owner.email}
                    authorId={comment.owner.id}
                    id={comment.id}
                    done={comment.done}
                    parentCommentId={comment.parent_id}
                    key={comment.id}
                    body={comment.body}
                    created={comment.created}
                    timecode={comment.timecode}
                    children={comment.children}
                    handleCommentEdit={this._handleCommentEdit}
                    handleDeleteComment={this._handleDeleteComment}
                    timecodeClick={this.props.timecodeClick}
                    modalOpen={this.props.modalOpen}
                    modalClose={this.props.modalClose}
                    closeReplies={this.state.closeReplies}
                    replyToOpen={this.state.replyToOpen}
                    closeOpenReplyForms={this._closeReplies}
                    commentToScroll={this._scrollToComment}
                    lockClick={this._handleLockClick} />
            );
        }.bind(this));
        var commentCount = <h3><strong>{commentNodes.length}</strong> { commentNodes.length === 1 ? 'Comment' : 'Comments' }</h3>;
        
        if (this.state.commentListHeight) {
                var commentListStyle = {
                height:this.state.commentListHeight,
                overflowY:'scroll'
            }
        }

        return (
            <section className="c-commentList__outer">
                <div ref="commentCount" className="c-commentList__count lede">
                    {commentNodes.length ? commentCount : null }
                </div>
                <div ref="commentList" className="c-commentList" style={commentListStyle}>
                    {commentNodes.length ? commentNodes : noComments }
                </div>
            </section>
        );
    }

});

module.exports = CommentsListContainer;