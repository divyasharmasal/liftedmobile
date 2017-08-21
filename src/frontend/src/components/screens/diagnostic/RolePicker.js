import { h, Component } from 'preact';
import { route } from 'preact-router';

export { RolePicker };

class RolePicker extends Component{
  constructor(props){
    super(props);
  }


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

    let levelOpts = {};

    qnData.options.forEach((option, i) => {
      i = option.id;
      const currentLevel = option.level;
      if (!levelOpts[currentLevel]){
        levelOpts[currentLevel] = [];
      }

      levelOpts[currentLevel].push(
        <div key={i} class="answer"
             onClick={() => {this.onAnswerClick(i)}}>
          <div class="option text role_option_text">
            <span class="desc">{option.desc}</span>
            <span class="role">{option.text}</span>
          </div>
        </div>
      );
    });

    let options = [];

    const levelAnchors = Array.from(new Set(
        qnData.options.map(option => option.level)))
      .sort((a, b) => a -b );

    Object.keys(levelOpts).sort((a, b) => a - b).forEach(level => {
      let optionElms = [];
      optionElms.push(
        <div class="level">
          <a name={"level_" + level}>
            Level {level} roles
          </a>
        </div>
      );
      levelOpts[level].forEach(opt => {
        optionElms.push(opt);
      });

      options.push(
        <div class="level_block">
          {optionElms}
        </div>
      );
    });

    return(
      <div className="question">
        {qnData.text && <h1>{qnData.text}</h1>}
        {this.renderLevelAnchorLinks(levelAnchors)}
        <div className="levels_and_opts">
          {options}
        </div>
      </div>
    );
  }
}
