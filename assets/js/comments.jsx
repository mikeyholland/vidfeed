var React = require('react');

var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(data) {
        console.log(JSON.parse(data.responseText));
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className="commentBox">
        <h2>Add your comment</h2>
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        <h2>Comments</h2>
        <CommentList data={this.state.data} />
      </div>
    );
  }
});

var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.owner.email} key={comment.id} time={comment.created} timecode={comment.timecode}>
          {comment.body}
        </Comment>
      );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: '', timecode: '0.0'};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleTimecodeChange: function (e) {
    this.setState({timecode: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, body: text, timecode: this.state.timecode});
    this.setState({author: '', text: '', timecode: '0.0'});
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange} />
        <input type="text" placeholder="Say something" value={this.state.text} onChange={this.handleTextChange} />
        <input type="number" step="0.01" placeholder="Timestamp" value={this.state.timecode}
               required="true" onChange={this.handleTimecodeChange} />
        <input type="submit" value="Post" />
      </form>
    );
  }
});

var Comment = React.createClass({
  formattedTime: function (time) {
    var minutes = Math.floor(time / 60);
    var seconds = Math.floor(time % 60).toFixed(0);
    var hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;
    seconds = (seconds.length == 1 ? "0" : "") + seconds;
    var hoursString = "";
    if (hours > 0) {
      hoursString = hours.toString() + ":";
      minutes = (minutes.toString().length == 1 ? "0" : "") + minutes.toString();
    }
    return hoursString + minutes + ":" + seconds;
  },

  render: function() {
    var formattedTime = this.formattedTime(this.props.timecode);
    return (
      <div className="comment">
        <p className="commentAuthor">author: {this.props.author}</p>
        <p>timestamp: {formattedTime}</p>
        <p>commented on: {this.props.time}</p>
        {this.props.children}
      </div>
    );
  }
});

module.exports = CommentBox;