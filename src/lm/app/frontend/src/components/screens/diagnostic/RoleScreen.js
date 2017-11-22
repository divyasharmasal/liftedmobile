import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../../Question';
import { authFetch } from '../../../lib/fetch';
import { RolePicker } from './RolePicker';
import {
  renderLoader,
  Screen, 
} from '../Screen';

export { RoleScreen };

class RoleScreen extends Screen{
  componentWillMount = () => {
    let verticalId = this.props.vertical;
    if (verticalId == 1){
      verticalId = 2;
    }

    let url = "/roles?";
    
    // Legal support
    if (verticalId === 3){
      const workplace = this.props.workplace;

      if (this.props.isNextRole){
        const role = this.props.selectedOptions["role"];
        url += "&r=" + encodeURIComponent(role);
      }

      url += "&o=" + encodeURIComponent(workplace) +
             "&v=" + encodeURIComponent(verticalId)
    }
    // In-house counsel and legal prac
    else{
      if (this.props.isNextRole){
        const role = this.props.selectedOptions["role"];
        url += "&r=" + encodeURIComponent(role);
      }
      url += "&v=" + encodeURIComponent(verticalId)
    }

    authFetch(url).then(response => {
      response.json().then(roles => {
        this.setState({ roles });
      });
    });
  }


  renderRolePicker(roleData){
    let result = [];
    let roles = {};
    roleData.forEach(r => {
      if (!roles[r.level]){
        roles[r.level] = [];
      }
      roles[r.level].push(r);
    });

    let options = [];
    Object.keys(roles).sort().forEach(level => {
      // sort by ID
      let r = roles[level].sort((a, b) => a.id - b.id);
      options = options.concat(r);
    });

    return (
      <RolePicker
        handleOptionSelect={this.handleOptionSelect}
        qnData={{options: options}} />
    );
  }


  handleOptionSelect = (role, isSingle) => {
    const levels = this.state.roles.map(r => r.level);
    const maxLevel = Math.max(...levels);
    if (this.props.nextScreenPath){
        this.props.handleOptionSelect(this.props.name, role, () => {
          route(this.props.nextScreenPath);
        });
    }
    else{
      if (role.level === maxLevel && isSingle){
        this.props.handleOptionSelect(this.props.name, role, () => {
          route(this.props.nextScreenPaths["atEnd"]);
        });
      }
      else{
        this.props.handleOptionSelect(this.props.name, role, () => {
          route(this.props.nextScreenPaths["hasNext"]);
        });
      }
    }
  }


  render() {
    if (!this.state.roles){
      return renderLoader();
    }
    return (
      <div class="pure-g">
        <div class="pure-u-1">
          {this.renderStartOver()}
          <div class="question">
            {this.props.isNextRole ?
              <h1>I aspire to work as a...</h1>
              :
              <h1>My job role is...</h1>
            }
            <p>
              Note: only legal support and in-house counsel roles are
              available for now.
            </p>
            {this.renderRolePicker(this.state.roles)}
          </div>
        </div>
      </div>
    );
  }
}
