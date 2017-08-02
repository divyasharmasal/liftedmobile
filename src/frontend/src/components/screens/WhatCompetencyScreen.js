import { h, Component } from 'preact';
import Question from '../Question';
import {Screen} from './Screen';

export {WhatCompetencyScreen};
class WhatCompetencyScreen extends Screen{
  constructor(props){
    super(props);

    if (!this.props.selectedAnswers || 
        Object.keys(this.props.selectedAnswers).length == 0){
      route("/");
    }
    else{
      let selectedVertical = this.props.selectedAnswers[0][0];
      let options = [];
      this.props.qnData.options[selectedVertical].forEach(x => {
        options.push({text: x});
      });
      this.state = {
        qnData: { 
          text: this.props.qnData.text,
          options: options,
        }
      };
    }
  }


  render = () => {
    if (!this.state.qnData){
      return <p>Loading...</p>;
    }
    return (
      <div className="pure-g">
        <div className="pure-u-1">
					<Question
						isMultiQn={false}
						handleAnswerSelect={this.handleAnswerSelect}
						qnData={this.state.qnData} 
					/>
				</div>
      </div>
    );
  }
}


