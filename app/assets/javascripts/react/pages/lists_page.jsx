import React from 'react';
import Relay from 'react-relay';
import ExecutionEnvironment from 'exenv';
import 'babel-core/polyfill';
import $ from 'jquery';
var visible = require('visible-element')($);

import {Link} from 'react-router';

import * as ListComponent from 'react/components/list_component';
import ListNameInput from 'react/components/list_name_input_component';
import * as EditListMutation from 'react/mutations/edit_list_mutation';
import * as DestroyListMutation from 'react/mutations/destroy_list_mutation';
import CreateListMutation from 'react/mutations/create_list_mutation';

class ListList extends React.Component {

    componentDidMount() {
        var _this = this;
        if (ExecutionEnvironment.canUseDOM) {
            $(document).scroll('scroll', function () {
                _this._handleScrollLoad.call(_this)
            });
        }
        this._handleScrollLoad()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.root.lists.edges != this.props.root.lists.edges) {
            this._handleScrollLoad()
        }
    }

    _lastListItemVisible() {
        var lastList = $(".list li").last();
        return visible.inViewport(lastList);
    }

    _loadMore() {
        this.props.relay.setVariables({
            count: this.props.relay.variables.count + 10
        });
    }

    _handleScrollLoad() {
        if (this._lastListItemVisible()) {
            this._loadMore();
        }
    }

    handleSave = (name) => {
        const {root} = this.props;

        Relay.Store.update(
            new CreateListMutation({root, name})
        );
    };

    renderLists() {
        var {lists} = this.props.root;
        const {root} = this.props;

        return lists.edges.map(({node}) =>
                <ListComponent.List
                    key={node.id}
                    list={node}
                    name={node.name}
                    root={root}
                    />
        );
    }

    render() {
        return (
            <section className="lists">
                <div>
                    <h1>Todo Lists</h1>
                    <ListNameInput
                        className="new-list"
                        autofocus
                        placeholder="What's your list called?"
                        onSave={this.handleSave}
                        />
                    <ul className="list">
                        {this.renderLists()}
                    </ul>
                </div>
            </section>
        );
    }
}

export const Queries = {
    root: (Component) => Relay.QL`
        query {
          root {
            ${Component.getFragment('root')}
          }
        }
    `
};

export const RelayContainer = Relay.createContainer(ListList, {
    initialVariables: {
        count: 10
    },
    fragments: {
        root: () => Relay.QL`
            fragment on RootLevel {
                id,
                lists(first: $count) {
                    edges {
                        node {
                            id,
                            name
                        }
                    }
                }
            }
        `,


    }
});


