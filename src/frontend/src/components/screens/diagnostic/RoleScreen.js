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
    //TODO: change once the framework provides data for verticals 1 and 2
    //const verticalId = selectedAnswers[0][0] + 1;
    const verticalId = 3;
    const selectedAnswers = this.props.selectedAnswers;
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


  //onRoleClick = roleId => {
    //console.log(roleId);
  //}


  //TODO: Refactor Question.js to do what this does in addition
  //to rendering regular qns
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
      //let items = [];
      //items.push({
        //text: level.name,
        //desc: level.desc
      //});

      //roles[level].forEach(role => {
        //items.push(
          //<div class="role"
            //onClick={() => { this.onRoleClick(role.id)}}>

            //<div class="name">
              //<p>{role.name}</p>
            //</div>

            //<div class="desc">
              //<p>{role.desc}</p>
            //</div>

          //</div>
        //);
      //});

      //result.push(
        //<div class="level row">
          //{items}
        //</div>
      //);
    });

    //return result;
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
