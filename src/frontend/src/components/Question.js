import { h, Component } from 'preact';

export default class Question extends Component{
  constructor(props){
    super(props);

    this.QN_TYPES = {
      SINGLE: 0,
      MULTI: 1,
    };

    this.type = this.QN_TYPES.SINGLE;
    if (this.props.isMultiQn){
      this.type = this.QN_TYPES.MULTI;
    }
  }


  componentWillMount = () => {
    this.setState({
      preSelected: this.props.preSelected,
    });
  }


  onAnswerClick = selectedIndex => {
    if (this.props.isRoleQn){
      this.props.handleAnswerSelect(selectedIndex, this.props.isMultiQn);
    }
    else if (this.type === this.QN_TYPES.SINGLE){
      this.props.handleAnswerSelect(selectedIndex, this.props.isMultiQn);
    }
    else if (this.type === this.QN_TYPES.MULTI){
      let index = this.state.preSelected.indexOf(selectedIndex);
      let preSelected;

      if (index > -1){
        preSelected = this.state.preSelected.concat();
        preSelected.splice(index, 1);
      }
      else if (index === -1){
        preSelected = this.state.preSelected.concat([selectedIndex])
      }

      this.setState({
        preSelected: preSelected
      }, () => {
        this.props.handleAnswerSelect(preSelected, this.props.isMultiQn);
      });
    }
  }


  render(){
    const qnData = this.props.qnData;
    const onAnswerClick = this.onAnswerClick;
    const tick = "✔";
    const options = qnData.options;

    let optionBtns = [];

    // Only show this message if props.scrollDownMsg is true
    let scrollDownMsg;
    let optionTextClass = "option text";
    if (this.props.isMultiQn){
      optionTextClass += " multi_option_text";
    }
    else if (this.props.isRoleQn){
      optionTextClass += " role_option_text";
    }

    if (this.props.scrollDownMsg){
      let msg = <p>Scroll down to see courses we've picked for you, or answer
                more questions for better results.</p>;
      scrollDownMsg = 
        <div className="scroll_down_msg">
          {msg}
        </div>
    }


    // Display questions and options.
    options.forEach((option, i) => {
      let optionDesc;
      if (this.props.isRoleQn){
        optionDesc = (
          <span class="desc">{option.desc}</span>
        );
      }

      let answerClass = "answer";
      if (this.state.preSelected){
        if (this.state.preSelected.indexOf(i) > -1){
          answerClass = "answer selected";
        }
      }

      if (this.props.isRoleQn){
        // override i with the ID of the role
        // TODO: refactor the code to make handleAnswerSelect
        // deal with IDs, not indices
        i = option.id;
      }

      optionBtns.push(
        <div key={i} 
            class={answerClass}
            onClick={() => {this.onAnswerClick(i)}}>
            <div class="option_tick">
            {tick}
          </div>
          <div class={optionTextClass}>
            {option.text}
            {optionDesc}
          </div>
        </div>
      );
    });

    return (
      <div className="question">
        <h1>{qnData.text}</h1>
        {scrollDownMsg}
        {optionBtns}
      </div>
    );
  }
}
