import { h, Component } from 'preact';
import { route } from "preact-router";


export class IntroScreen extends Component{
  render(){
    const bodyTag = document.getElementsByTagName("body")[0];
    const topMsg = bodyTag.dataset.topMsg;
    const topLink = bodyTag.dataset.topLink;

    return(
      <div class="pure-g">
        {topMsg != null &&
         <div class="pure-u-1 top_msg">
           <a href="/cms" target="_blank"><p>{topMsg}</p></a>
         </div>
        }
        <div class="pure-u-1">
          <div class="sal_logo no_user_select">
            <a target="_blank" href="https://www.sal.org.sg/">
              <img alt="LIFTED Mobile - Singapore Academy of Law"
                   src="/static/app/dist/images/sal_logo.png" />
             </a>
             <a target="_blank" 
               href="https://www.sal.org.sg/Resources-Tools/Legal-Education/LIFTED/Overview">
              <span class="lifted">LIFTED</span>
            </a>
          </div>

          <div class="intro">
            <div class="text">
              <p>Legal learning <wbr />made simple.</p>
            </div>
          </div>

          <div class="intro_option">
            <a href="/analysis">
              <div class="icon">
                <img src="/static/app/dist/images/intro_tailored.png" />
              </div>
              <div class="desc">
                <h2>Identify your learning needs.</h2>
              </div>
            </a>
          </div>

          <div class="intro_option">
            <a href="/tech">
              <div class="icon">
                <img src="/static/app/dist/images/intro_tech.png" />
              </div>
              <div class="desc">
                <h2>Are you legal-tech savvy?</h2>
              </div>
            </a>
          </div>

          <div class="intro_option">
            <a href="/browse">
              <div class="icon">
                <img src="/static/app/dist/images/intro_courses.png" />
              </div>
              <div class="desc">
                <h2>Browse CPD courses.</h2>
              </div>
            </a>
          </div>


          <div class="credits">
            {/*
            <p>
              This app is part of the <a href="https://www.sal.org.sg/lifted">
              Legal Industry Framework for Training and Education</a>, an 
              initiative of the <a href="https://www.sal.org.sg">
              Singapore Academy of Law</a>.
            </p>
            */}
            <p>
              © 2018 Singapore Academy of Law. All rights reserved.
            </p>
            <p>
              <a target="_blank"
                href="https://www.sal.org.sg/Footer/Terms-Conditions">
                Terms &amp; Conditions</a> <a target="_blank"
                href="https://www.sal.org.sg/Footer/Privacy-Policy">
                Privacy Policy
              </a>
            </p>
            {/*
            <p>
              <a href="/terms" target="_blank">
                Click here to view this site's terms of use and
                associated software licenses.
              </a>
            </p>
            */}
          </div>
        </div>

      </div>
    );
  }
}

