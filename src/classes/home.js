'use strict';

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Picker
} from 'react-native';
import { storeData, getData, remData } from '../services/asyStorage';

export default class Home extends Component{
  static navigationOptions = {
    title: 'Home'
  };

  constructor(props){
    super(props);
    this.state = {
      charList: [ ],

      charString: "",

      loggedIn: true
    }
  }

  componentDidMount(){
    storeData("ip", "http://157.230.101.45:3004/dnd").then(() => {
      this._checkLogged();
    });
    
    this.props.navigation.addListener('willFocus', this._checkLogged);
  }

  _checkLogged = async () => {
    const authKey = await getData("authKey");

    if(authKey === undefined) this.setState({ loggedIn: false });
    else{
      this.setState({ loggedIn: true });
      this._getCharList(authKey);
    }
  }

  _logout = () => {
    // Clear: sessionId, charString, charList
    remData("authKey").then(() => {
      remData("charString").then(() => {
        this.setState({ charList: [] });
        this._checkLogged();
      });
    });
  }

  _valueChange = (charString) => {
    this.setState({ charString: charString });
    storeData("charString", charString);
  }

  _navSpellList = async () => {
    const ip = await getData("ip");

    this.props.navigation.navigate('SpellList', { title: "Spell List", url: `${ip}/general/spells`, charSpells: false});
  }

  render(){
    return(
      <ScrollView style={{marginTop: 10}}>
        { this._showHeader() }

        { this._showCharacter() }

        <TouchableOpacity onPress={() => this._navSpellList()} style={styles.button}>
          <Text style={styles.text}>Spell List</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => this.props.navigation.navigate('Converter')} style={styles.button}>
          <Text style={styles.text}>Converter</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Render functions
  _showHeader = () => {
    if(this.state.loggedIn){
      if(this.state.charList.length > 0){
        return(
          <View>
            { this._loadLoggedInButtons() }

            <View style={styles.container}>
              <Picker style={{height: 50, flex: 1}} onValueChange={(itemValue) => this._valueChange(itemValue)} selectedValue={this.state.charString}>
                { this.state.charList.map(c => (this._renderCharList(c))) }
              </Picker>
            </View>
            <TouchableOpacity onPress={() => this.props.navigation.navigate('Character')} style={styles.button}>
              <Text style={styles.text}>Character</Text>
            </TouchableOpacity>
          </View>
        )
      }
      else{
        return(
          <View>
            { this._loadLoggedInButtons() }
          </View>        
        )
      }
    }
    else{
      return(
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')} style={{flex: 1}}>
            <Text style={styles.text}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => this.props.navigation.navigate('Register')} style={{flex: 1}}>
            <Text style={styles.text}>Register</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }
  _showCharacter = () => {
    if(this.state.loggedIn){
      return(
        <View>

        </View>
      )
    }
  }
  _loadLoggedInButtons = () => {
    return(
      <View style={{flexDirection: 'row', marginBottom: 20}}>
        <TouchableOpacity onPress={() => this.props.navigation.navigate('Account', { charList: this.state.charList })} style={{flex: 1}}>
          <Text style={[styles.text, {paddingLeft: 10}]}>Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => this._logout()} style={{flex: 1}}>
          <Text style={[styles.text, {textAlign: 'right', paddingRight: 10}]}>Logout</Text>
        </TouchableOpacity>
      </View>
    )
  }
  _renderCharList = (c) => {
    return(
      <Picker.Item key={c.charString} label={c.firstname + " " + c.lastname + " - Lvl: " + c.level} value={c.charString} />
    )
  }

  // Data fetching
  _getCharList = async (authKey) =>{
    const ip = await getData("ip");

    fetch(`${ip}/user/charList/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authKey}`
      }
    })
    .then((res) => res.json())
    .then((resJ) => {
      if(resJ.data.length !== 0){
        this.setState({ charList: resJ.data });

        getData("charString").then((charString) => {
          if(charString === undefined){
            storeData("charString", resJ.data[0].charString);
            this.setState({ charString: resJ.data[0].charString });
          }
          else{
            this.setState({ charString: charString });
          }
        });
      }
    });
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,

    paddingTop: 5,
    paddingBottom: 5,

    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#A9A9A9',
    margin: 10,
  },
  text: {
    fontSize: 18
  }
});