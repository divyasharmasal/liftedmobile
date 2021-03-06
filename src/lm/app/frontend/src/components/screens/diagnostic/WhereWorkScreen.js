import { h, Component } from 'preact';
import Question from '../../Question';
import { Screen, } from '../Screen';

export { WhereWorkScreen };

class WhereWorkScreen extends Screen{
  render() {
    return (
      <div className="pure-g">
        <div className="pure-u-1">
          {this.renderStartOver()}
					<Question
            qnNum={this.props.qnNum}
						isMultiQn={false}
						handleOptionSelect={this.handleOptionSelect}
						qnData={this.props.qnData} 
					/>
        </div>
      </div>
    );
  }
}
