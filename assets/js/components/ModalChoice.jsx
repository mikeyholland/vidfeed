import React from 'react';

const ModalChoice = React.createClass({

    propTypes: {
        heading:        React.PropTypes.string.isRequired,
        closeModal:     React.PropTypes.func,
        text:           React.PropTypes.string,
        yesAction:      React.PropTypes.func.isRequired,
        noAction:       React.PropTypes.func.isRequired,
        thirdAction:    React.PropTypes.func,
        yesText:        React.PropTypes.string.isRequired,
        noText:         React.PropTypes.string.isRequired,
        thirdText:      React.PropTypes.string,
        confirmOwner:   React.PropTypes.string
    },

    render:function() {
        if (this.props.confirmOwner) {
            var confirmOwner = <span>{this.props.confirmOwner}</span>
        }

        if (this.props.submitted) {
            return (
                <div className="modal__submitted">
                    <h3 className="box__title">{this.props.submittedMsg}</h3>
                </div>
            );
        }

        if (this.props.thirdAction) {
            var thirdAction = <li className="o-list-inline__item">
                                <a href="#" onClick={this.props.thirdAction} className="o-btn o-btn--blue o-btn--small">{this.props.thirdText}</a>
                            </li>
        }

        return (
            <div className="modal__content">
                <div className="box__header">
                    <h3 className="box__title">{this.props.heading}</h3>
                    { this.props.closeModal ? <a href="#" onClick={this.props.closeModal} className="box__close">×<span className="u-hidden-visually">Close</span></a> : null }
                </div>
                <div className="modal__body u-padding-small u-padding-top">
                    <p>{this.props.text}</p>
                    <ul className="o-list-inline">
                        <li className="o-list-inline__item">
                            <a href="#" onClick={this.props.yesAction} className="o-btn o-btn--primary o-btn--small">{this.props.yesText}{confirmOwner}</a>
                        </li>
                        {thirdAction}
                        <li className="o-list-inline__item">
                            <a href="#" onClick={this.props.noAction} className="o-btn o-btn--secondary o-btn--small">{this.props.noText}</a>
                        </li>
                    </ul>
                </div>  
            </div>
        );
    }

});

module.exports = ModalChoice;   