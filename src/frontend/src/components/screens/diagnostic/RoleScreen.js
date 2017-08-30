import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../../Question';
import { authFetch } from '../../fetch';
import { RolePicker } from './RolePicker';
import {
  renderLoader,
  renderStartOver,
  Screen, 
} from '../Screen';

export { RoleScreen };

class RoleScreen extends Screen{
  constructor(props){
    super(props);
  }


  componentWillMount = () => {
    //TODO: change once the framework provides data for verticals 1 and 2
    //const verticalId = selectedAnswers[0][0] + 1;
    const verticalId = 3;
    const selectedAnswers = this.props.selectedAnswers;
    let storedSelectedAnswers = sessionStorage.getItem("selectedAnswers");
    if ((!selectedAnswers && !storedSelectedAnswers) ||
         (Object.keys(selectedAnswers).length === 0 
           && !storedSelectedAnswers)){
      route("/");
    }
    else{
      const workplace = selectedAnswers[4][0];
      let url = "/roles?";

      if (this.props.isNextRole){
        const role = selectedAnswers[5][0];
        url += "&r=" + encodeURIComponent(role);
      }

      // law firm : 0
      // corp/org : 1
      url += "&o=" + encodeURIComponent(workplace) +
             "&v=" + encodeURIComponent(verticalId)
      authFetch(url).then(response => {
        response.json().then(roles => {
          this.setState({ roles });
        });
      });
    }
  }


  renderRolePicker(roleData){
    let result = [];
    let roles = {};
    roleData.forEach(r => {
      if (!roles[r.level]){
        roles[r.level] = [];
      }
      roles[r.level].push({
        text: r.name,
        desc: r.desc,
        id: r.id,
        level: r.level,
      });
    });

    let options = [];
    Object.keys(roles).sort().forEach(level => {
      // sort by ID
      let r = roles[level].sort((a, b) => a.id - b.id);
      options = options.concat(r);
    });

    return (
      <RolePicker
        handleAnswerSelect={this.handleAnswerSelect}
        qnData={{options: options}} />
    );
  }


  render() {
    if (!this.state.roles){
      return renderLoader();
    }
    return (
      <div class="pure-g">
        <div class="pure-u-1">
          {renderStartOver()}
          <div class="question">
            <h1>My job role is...</h1>
            <p>Note: only legal support roles are available for now.</p>
            {this.renderRolePicker(this.state.roles)}
          </div>
        </div>
      </div>
    );
  }
}
