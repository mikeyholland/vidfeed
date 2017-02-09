import React from 'react';
import { Router, Route, Link, browserHistory } from 'react-router';
import FormattedRelativeDate from 'react-npm-formatted-relative-date';

import Actions from '../components/Actions';

const FeedListItem = React.createClass({

    propTypes: {
        route:                 React.PropTypes.string.isRequired,
        imgClasses:            React.PropTypes.string.isRequired,
        feedTitle:            React.PropTypes.string.isRequired,
        videoThumb:            React.PropTypes.string.isRequired,
        created:               React.PropTypes.string.isRequired,
        moveToProject:         React.PropTypes.func.isRequired,
        editFeedTitle:         React.PropTypes.func.isRequired,
        deleteFeed:            React.PropTypes.func.isRequired
    },

    render: function() {

        return (
            <div>
                <Link to={this.props.route}>
                    <article className="c-feedItem">
                        <div className={this.props.imgClasses}>
                            <img src={this.props.videoThumb} alt={this.props.feedTitle} />
                        </div>
                        <div className="u-padding-small u-padding-bottom">
                            <span className="c-feedItem__title">{this.props.feedTitle}</span>
                            <Actions
                                addAction={this.props.moveToProject}
                                editAction={this.props.editFeedTitle}
                                deleteAction={this.props.deleteFeed} />
                            <span className="c-feedItem__created"><FormattedRelativeDate date={this.props.created} /></span>
                        </div>
                    </article>
                </Link>
            </div>
        );
    }

});

module.exports = FeedListItem;