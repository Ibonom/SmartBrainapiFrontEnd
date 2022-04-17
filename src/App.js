import './App.css';
import React, {Component} from 'react'
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Particles from "react-tsparticles";
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';









const particlesOptions = 
  {
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "repulse",
        },
        resize: true,
      },
      modes: {
        bubble: {
          distance: 400,
          duration: 2,
          opacity: 0.8,
          size: 40,
        },
        push: {
          quantity: 1,
        },
      },
    },
    particles: {
      color: {
        value: "#000000",
      },
      links: {
        color: "#ffffff",
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1,
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: "none",
        enable: true,
        outMode: "bounce",
        random: false,
        speed: 2,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "polygon",
      },
      size: {
        random: true,
        value: 5,
      },
    },
    detectRetina: true,
  }

const initialState = { // wyciagniecie tego poza aplikacje pozwala resetować profil 
  input: "",
  imageUrl:'',
  box: {},
  route:'signin',
  isSignedIn: false,
  user:{
    id: '',
    name:'',
    email:'',
    entries: 0,
    joined: ''
  }
}
class App extends Component{
  constructor(){
    super()
    this.state = initialState 
  }
  loadUser = (data) =>{
    this.setState({user: {
        id: data.id,
        name:data.name,
        email:data.email,
        entries: data.entries,
        joined: data.entries
    }})
  }
  
  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box
    const image = document.getElementById("inputimage")
    const width = Number(image.width)
    const height = Number(image.height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    console.log(box)
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
    console.log(event.target.value)
  }
  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input})
    fetch('https://evening-peak-71604.herokuapp.com/imageurl',{
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        input: this.state.input
    })
  })
  .then(response => response.json())
  .then(result => {
    if (result){
      fetch('https://evening-peak-71604.herokuapp.com/image',{
        method: 'put',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
        id: this.state.user.id,
      })
    })
      .then(response => response.json())
      .then(count => {
        this.setState(Object.assign(this.state.user, {entries: count}))
      }).catch(console.log)
    }
    this.displayFaceBox(this.calculateFaceLocation(result))})
    .catch(error => console.log('error', error));
  }

  onRouteChange = (route) =>{
    if(route === 'signout'){
      this.setState(initialState)
    }else if (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route:route})
  }

  render(){
    const {isSignedIn, imageUrl, route} = this.state
    return(
    <div className="App">
      
      <Particles className='particles' params={particlesOptions}/>
      <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange} />
      { route === 'home'
        ? 
        <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries}/>
          <ImageLinkForm onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
          <FaceRecognition box={this.state.box} imageUrl={imageUrl}/>
        </div>
        : (
          route === 'signin' ?
          <SignIn loadUser={this.loadUser} onRouteChange ={this.onRouteChange}/>
          :
          <Register loadUser={this.loadUser} onRouteChange ={this.onRouteChange}/>
        )
        
      }
    </div>
    )
  }
}

export default App;
