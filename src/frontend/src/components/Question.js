import { h, Component } from 'preact';

export default class Question extends Component{
  constructor(props){
    super(props);
    this.onAnswerClick = this.onAnswerClick.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);

    this.QN_TYPES = {
      SINGLE: 0,
      MULTI: 1,
    };

    this.type = this.QN_TYPES.SINGLE;
    if (this.props.isMultiQn){
      this.type = this.QN_TYPES.MULTI;
    }
  }


  componentWillMount(){
    this.setState({
      preSelected: this.props.preSelected,
    });
  }


  onAnswerClick(e){
    let selectedIndex = parseInt(e.target.dataset.index, 10);
    if (this.type === this.QN_TYPES.SINGLE){
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
    let qnData = this.props.qnData;
    let onAnswerClick = this.onAnswerClick;
    let isVerticalQn = this.props.qnNum === 0;

    let options = qnData.options;
    let optionBtns = [];

    // Only show this message if props.scrollDownMsg is true
    let scrollDownMsg;
    let optionTextClass = "option text";
    if (this.props.isMultiQn){
      optionTextClass += " multi_option_text";
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
      let answerClass = "answer";
      if (this.state.preSelected){
        if (this.state.preSelected.indexOf(i) > -1){
          answerClass = "answer selected";
        }
      }
      let tick = "✔";
      optionBtns.push(
        <div key={i} 
            data-index={i}
            class={answerClass}
            onClick={onAnswerClick}>
            <div 
              data-index={i}
              class="option_tick">
            {tick}
          </div>
          <div 
            data-index={i}
            class={optionTextClass}>
            {option.text}
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
