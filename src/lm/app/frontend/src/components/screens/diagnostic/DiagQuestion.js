import { h, Component } from 'preact';
import { route } from 'preact-router';

export class DiagQuestion extends Component{
  constructor(props){
    super(props);
    this.state = {
      selectedAnswerId: this.props.selectedAnswerId,
      shouldHighlight: false,
      highlight: this.props.highlight,
      showHelp: false,
    };
  }

  componentWillReceiveProps(nextProps){
    if (this.props.highlight !== nextProps.highlight ||
        this.state.selectedAnswerId !== nextProps.selectedAnswerId
    ){
      this.setState({ 
        highlight: nextProps.highlight,
        selectedAnswerId: nextProps.selectedAnswerId,
      });
    }
  }


  handleOptionSelect = answerNum => {
    if (this.state.selectedAnswerId === answerNum){
      answerNum = null;
    }

    this.setState({
      selectedAnswerId: answerNum,
    }, () => {
      this.props.handleOptionSelect(this.props.qn.id, answerNum);
    });
  }


  showHelp = () => {
    this.setState({
      showHelp: !this.state.showHelp,
    });
  }


  render(){
    let qn = this.props.qn;
    const answers = ["Yes", "No"];
    let ansElms = [];
    answers.forEach((answer, i) => {
      let answerClass = "no_user_select answer";
      if (i === this.state.selectedAnswerId){
        answerClass += " selected";
      }
      ansElms.push(
        <div class={answerClass} 
          onClick={() => {this.handleOptionSelect(i)}}>
          {answer}
        </div>
      );
    });

    let highlightClass = "";
    if (this.state.highlight){
      highlightClass = "highlight";
    }

    //let expln = [];
    //qn.expln.split("\n").forEach(row => {
      //expln.push(
        //<li>{row}</li>
      //);
    //});

    //let desc_prompt;
    //if (this.state.showHelp){
      //desc_prompt = "Hide description ▲";
    //}
    //else{
      //desc_prompt = "Show description ▼";
    //}

    return (
      <div class="diag_qn">
        <div class="diag_left">
          <p class={highlightClass}>{qn.desc}</p>
          {/*
          <p class="diag_whatsthis"
            onClick={this.showHelp}>
            {desc_prompt}
          </p>
          {this.state.showHelp && 
            <div class="diag_help">
              <ul>
                {expln}
              </ul>
            </div>
          }
          */}
        </div>
        <div class="diag_right">
          <div class="diag_opts">
            {ansElms}
          </div>
        </div>
      </div>
    );
  }
}


