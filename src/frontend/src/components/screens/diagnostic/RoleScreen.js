import { h, Component } from 'preact';
import { route } from 'preact-router';
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

    return (<Question
      qnNum={this.props.qnNum}
      isMultiQn={false}
      isRoleQn={true}
      handleAnswerSelect={this.handleAnswerSelect}
      qnData={{options: options}}
    />);
  }


  render() {
    if (!this.state.roles){
      return (
        <div class="pure-g">
          <div class="pure-u-1">
            <div class="load1">
              <div class="loader">Loading courses...</div>;
            </div>
          </div>
        </div>
      )
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
