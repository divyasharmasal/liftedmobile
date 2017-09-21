import { h, Component } from 'preact';
import { route } from 'preact-router';
import Question from '../Question';
import {
  renderLoader,
  Screen, 
} from './Screen';


export {WhatCompetencyScreen};

class WhatCompetencyScreen extends Screen{
  componentWillMount = () => {
    let selectedVertical = this.props.selectedOptions["vertical"];
    if (selectedVertical){
      let options = [];
      this.props.qnData.options[selectedVertical].forEach(x => {
        options.push({text: x.text, id: x.id});
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
      return renderLoader();
    }
    return (
      <div className="pure-g">
        <div className="pure-u-1">
          {this.renderStartOver()}
					<Question
						isMultiQn={false}
						handleOptionSelect={this.handleOptionSelect}
						qnData={this.state.qnData} 
					/>
				</div>
      </div>
    );
  }
}


