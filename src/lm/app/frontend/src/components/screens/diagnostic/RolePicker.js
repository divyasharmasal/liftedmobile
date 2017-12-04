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
      this.props.handleRoleSelect(this.props.roles[0], true);
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
        <div class="roles answer no_user_select" onClick={ () => {
            this.props.handleRoleSelect(role, false);
          }}>
          <p class="role_name">{role.name}</p>
          <p>{role.desc}</p>
        </div>
      );
    }
    else{
      roles = this.props.roles.map(role =>
        <p class="role_name">{role.name}</p>
      );
    }

    let boxClass = "";
    if (!this.state.showRoles){
      boxClass = "answer no_user_select";
    }
    return (
      <div class={boxClass} 
           onClick={this.handleLevelSelect}>
        {this.state.showRoles && 
          <p class="prompt">
            Great! Now, select the description which best fits your job:
          </p>
        }
        {roles}
        {this.props.roles.length == 1 &&
          <p>
            {this.props.roles[0].desc}
          </p>
        }
      </div>
    );
  }
}


class RolePicker extends Component{
  renderLevelAnchorLinks = levelAnchors => {
    let levelAnchorLinks = [];
    Array.from(levelAnchors).sort().forEach(levelNum => {
      levelAnchorLinks.push(
        <a href={"#level_" + levelNum}>{levelNum}</a>
      );
    });
    return <p class="select_level">Select level: {levelAnchorLinks}</p>
  }


  showSpecInfo = () => {
    this.setState({
      specInfoVisible: true,
    });
  }


  render(){
    let levelRoles = {};
    this.props.qnData.options.forEach((option, i) => {
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
          <p class="level_text">
            Level {level}
          </p>
          <RoleLevelPicker
            handleRoleSelect={this.props.handleOptionSelect}
            level={level}
            roles={levelRoles[level]} />
        </div>
      );
    });
    return (
      <div class="role_picker">
        <p class="prompt">
          (select the best fit category)
          <span 
            onClick={this.showSpecInfo}
            onMouseOver={this.showSpecInfo}
            class="spec_info">
            <img src="/static/app/dist/images/info_circle.png" />
          </span>
        </p>
        {this.state.specInfoVisible &&
            <p class="prompt">
              Note: more job specialisms will be added to this tool over time.
            </p>
        }
        {levelSections}
      </div>
    );
  }
}
