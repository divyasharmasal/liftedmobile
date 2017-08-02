import { h, Component } from 'preact';
import Question from '../../Question';
import { authFetch } from '../../fetch';
import {
  Screen, 
} from '../Screen';

export {RoleScreen};

class RoleScreen extends Screen{
  constructor(props){
    super(props);
  }


  componentWillMount = () => {
    let selectedAnswers = this.props.selectedAnswers;
    const workplace = selectedAnswers[4][0];
    //const verticalId = selectedAnswers[0][0] + 1;
    //TODO: change once the framework provides data for verticals 1 and 2
    const verticalId = 3;
    // law firm : 0
    // corp/org : 1
    let url = "/roles?o=" + encodeURIComponent(workplace) +
          "&v=" + encodeURIComponent(verticalId)
    authFetch(url).then(response => {
      response.json().then(roles => {
        this.setState({ roles });
      });
    });
  }


  onRoleClick = roleId => {
    console.log(roleId);
  }


  renderRolePicker(roleData){
    let result = [];
    let roles = {};
    roleData.forEach(r => {
      if (!roles[r.level]){
        roles[r.level] = [];
      }
      roles[r.level].push({
        name: r.name,
        desc: r.desc,
        id: r.id,
      });
    });

    Object.keys(roles).sort().forEach(level => {
      let items = [];

      roles[level].forEach(role => {
        items.push(
          <div class="role"
            onClick={() => { this.onRoleClick(role.id)}}>

            <div class="name">
              <p>{role.name}</p>
            </div>

            <div class="desc">
              <p>{role.desc}</p>
            </div>

          </div>
        );
      });

      let levelDiv = (
        <div class="level row">
          {items}
        </div>
      );
      result.push(levelDiv);
    });
    return result;
  }


  render() {
    if (!this.state.roles){
      return <p>Loading...</p>;
    }
    return (
      <div class="pure-g">
        <div class="pure-u-1">
          <div class="question">
            <h1>What is your job?</h1>
            <p>Please select what best describes what you do at work.</p>
            <p>Note: these are legal support roles only, and roles for the
              other verticals will be added soon.</p>
            <div class="role_picker">
              {this.renderRolePicker(this.state.roles)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
