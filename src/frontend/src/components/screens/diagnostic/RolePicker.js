import { h, Component } from 'preact';
import { route } from 'preact-router';

export { RolePicker };


class RoleLevelPicker extends Component{
  constructor(props){
    super(props);
    this.state = {
      showRoles: false,
    };
  }


  handleLevelSelect = () => {
    if (this.props.roles.length == 1){
      this.props.handleRoleSelect(this.props.roles[0].id);
    }
    else{
      this.setState({
        showRoles: true,
      });
    }
  }


  render(){
    let roles = [];
    if (this.state.showRoles){
      roles = this.props.roles.map(role =>
        <div class="roles answer" onClick={ () => {
            this.props.handleRoleSelect(role.id);
          }}>
          <p class="role_name">{role.text}</p>
          <p>{role.desc}</p>
        </div>
      );
    }
    else{
      roles = this.props.roles.map(role =>
        <p>{role.text}</p>
      );
    }

    let boxClass = "";
    if (!this.state.showRoles){
      boxClass = "answer";
    }
    return (
      <div class={"roles " + boxClass}
        onClick={this.handleLevelSelect} >
        {this.state.showRoles && 
          <p class="prompt">
            Great! Now, select the description which best fits your job:
          </p>
        }
        {roles}
        {this.props.roles.length == 1 &&
          <p class="desc">
            {this.props.roles[0].desc}
          </p>
        }
      </div>
    );
  }
}


class RolePicker extends Component{
  onAnswerClick = selectedIndex => {
    this.props.handleAnswerSelect(selectedIndex, false);
  }


  renderLevelAnchorLinks = levelAnchors => {
    let levelAnchorLinks = [];
    Array.from(levelAnchors).sort().forEach(levelNum => {
      levelAnchorLinks.push(
        <a href={"#level_" + levelNum}>{levelNum}</a>
      );
    });
    return <p class="select_level">Select level: {levelAnchorLinks}</p>
  }


  render(){
    const qnData = this.props.qnData;
    const onAnswerClick = this.onAnswerClick;
    let levelRoles = {};
    qnData.options.forEach((option, i) => {
      i = option.id;
      const currentLevel = option.level;
      if (!levelRoles[currentLevel]){
        levelRoles[currentLevel] = [];
      }
      levelRoles[currentLevel].push(option);
    });

    let levelSections = [];
    Object.keys(levelRoles).sort((a, b) => a - b).forEach(level => {
      levelSections.push(
        <div class="level">
          <p class="level_text">Level {level}:</p>
          <RoleLevelPicker
            handleRoleSelect={this.onAnswerClick}
            level={level}
            roles={levelRoles[level]} />
        </div>
      );
    });
    return (
      <div class="role_picker">
        <p class="prompt">
          If you see your job role in any of these boxes, select it:
        </p>
        {levelSections}
      </div>
    );
  }

  //render(){
    //const qnData = this.props.qnData;
    //const onAnswerClick = this.onAnswerClick;
    //let levelOpts = {};

    //qnData.options.forEach((option, i) => {
      //i = option.id;
      //const currentLevel = option.level;
      //if (!levelOpts[currentLevel]){
        //levelOpts[currentLevel] = [];
      //}

      //levelOpts[currentLevel].push(
        //<div key={i} class="answer"
             //onClick={() => {this.onAnswerClick(i)}}>
          //<div class="option text role_option_text">
            //<span class="desc">{option.desc}</span>
            //<span class="role">{option.text}</span>
          //</div>
        //</div>
      //);
    //});


    //const levelAnchors = Array.from(new Set(
        //qnData.options.map(option => option.level)))
      //.sort((a, b) => a -b );

    //let options = [];
    //Object.keys(levelOpts).sort((a, b) => a - b).forEach(level => {
      //let optionElms = [];
      //optionElms.push(
        //<div class="level">
          //<a name={"level_" + level}>
            //Level {level} roles
          //</a>
        //</div>
      //);
      //levelOpts[level].forEach(opt => {
        //optionElms.push(opt);
      //});

      //options.push(
        //<div class="level_block">
          //{optionElms}
        //</div>
      //);
    //});

    //return(
      //<div className="question">
        //{qnData.text && <h1>{qnData.text}</h1>}
        //{this.renderLevelAnchorLinks(levelAnchors)}
        //<div className="levels_and_opts">
          //{options}
        //</div>
      //</div>
    //);
  //}
}
