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
    let url = "/roles?";
    
    // Legal support
    if (verticalId === 3){
      const workplace = this.props.workplace;

      if (this.props.isNextRole){
        const role = this.props.selectedOptions["role"];
        url += "&r=" + encodeURIComponent(role.id);
      }

      url += "&o=" + encodeURIComponent(workplace) +
             "&v=" + encodeURIComponent(verticalId)
    }
    // In-house counsel and legal prac
    else{
      if (this.props.isNextRole){
        const role = this.props.selectedOptions["role"];
        url += "&r=" + encodeURIComponent(role.id);
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
        <div class="pure-u-1-3">
          <a class="no_user_select top_nav_link home" 
             onClick={() => { route("/") }}>
            <img src="/static/app/dist/images/home.png" />
            Home
          </a>
        </div>
        <div class="pure-u-1-3 start_over_parent">
          {this.renderStartOver()}
        </div>
        <div class="pure-u-1">
          <div class="question">
            {this.props.isNextRole ?
              <h1 class="next_role_title">I aspire to work as a...</h1>
              :
              <h1 class="next_role_title">My job role is...</h1>
            }
            {this.renderRolePicker(this.state.roles)}
          </div>
        </div>
      </div>
    );
  }
}
