import React from 'react';

import HeaderContainer from '../containers/HeaderContainer';
import ProjectsListContainer from '../containers/ProjectsListContainer';
import FeedListContainer from '../containers/FeedListContainer';

const Dashboard = React.createClass({

    getInitialState:function() {
        return {

            windowHeight:undefined
        }
    },

    componentDidMount: function() {
        this._resizeContent();
        window.addEventListener('resize', this._resizeContent);
    },

    componentWillUnmount: function() {
        window.removeEventListener('resize', this._resizeContent);
    },

    _resizeContent : function() {
        var windowWidth = window.innerWidth;
        if (windowWidth < 740) {
            this.setState({
                windowHeight:undefined
            });
            return;
        }
        var headerHeight = this.refs.header.clientHeight;
        var remainingHeight = window.innerHeight - headerHeight;
        this.setState({
            windowHeight:remainingHeight
        });
    },

    render: function() {
        return (
            <div>
                <div ref="header">
                    <HeaderContainer />
                </div>
                <div className="o-layout">
                    <div className="o-layout__item u-1/4@tablet u-1/5@desktop">
                        <ProjectsListContainer
                            windowHeight={this.state.windowHeight} />
                    </div>
                    <div className="o-layout__item u-3/4@tablet u-4/5@desktop">
                        <FeedListContainer
                            windowHeight={this.state.windowHeight} />
                    </div>
                </div>
            </div>
        );
    }

});

module.exports = Dashboard;