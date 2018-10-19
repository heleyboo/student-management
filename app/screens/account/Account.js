import React, { Component } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, View } from 'react-native';
import { Container, Header, Content, Text, Left, Button, Body, Title, Icon, Right } from 'native-base';
import realm from '@realm/realm';
import ProgressDialog from '@components/ProgressDialog'
import MemberInfo from '@components/MemberInfo'

const SheetID = '1lTgFpuo-4H-WLCwseZqSDJMNnYFd0Zd9aEbne3mMe1E';
const API = 'https://run.blockspring.com/api_v2/blocks/c7bb13fb48fea532adc9aac7c2a46607?api_key=br_98235_66093b70a65e37aa2c913d02b1bdce3ea8ea6463';

export class Account extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isProgress: false,
            status: 'Members Screen',
            currentMemberId: 0,
            currentMember: null,
            curRealm: realm.objects('Members'),
        }
    }

    _setProgressbar = (open) => {
        this.setState({ isProgress: open })
    }

    _getDataSource() {
        this._setProgressbar(true);
        fetch(API, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson.members);
                this.setState({ status: 'Get data success!' })
                realm.write(() => {
                    let allMembers = realm.create('Members', { members: [] });
                    for (let m of responseJson.members) {
                        allMembers.members.push({
                            id: m.id,
                            name: m.name,
                            skill: m.skill,
                        })
                    }
                    console.log(allMembers.members);
                    this.setState({ curRealm: allMembers })
                })
                this._setProgressbar(false);
            })
            .catch((error) => {
                console.error(error);
                this._setProgressbar(false);
                this.setState({ status: 'Get data fail!!!' })
            });
    };

    _updateCurrentMember() {
        let id = this.state.currentMemberId
        let listMem = this.state.curRealm
        if (!listMem || !listMem.members || id == '') {
            this.setState({ currentMember: 'Not found any record, please get data first' })
        } else {
            if (id >= listMem.members.length) {
                this.setState({ currentMember: ('Not found, current have only ' + listMem.members.length + ' records (include id = 0)') })
            } else {
                let curMem = listMem.members[id].name
                this.setState({ currentMember: curMem })
            }
        }

    }

    render() {
        return (
            <Container>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.openDrawer()}>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Account Screen</Title>
                    </Body>
                    <Right />
                </Header>
                <Content style={styles.container}>
                    <TouchableOpacity style={styles.button}
                        onPress={() => this._getDataSource()}>
                        <Text style={styles.txtButton} >Get data</Text>
                        <ProgressDialog visible={this.state.isProgress} />
                    </TouchableOpacity>
                    <Text style={styles.txtStatus}>{this.state.status}</Text>
                    <Text style={styles.txtTitle} >Input id to field below</Text>
                    <TextInput style={styles.textInput}
                        value={this.state.currentMemberId}
                        editable={true} maxLength={3} keyboardType='number-pad'
                        onChangeText={(num) => this.setState({ currentMemberId: num })} />
                    <TouchableOpacity style={styles.button}
                        onPress={() => this._updateCurrentMember()}>
                        <Text style={styles.txtButton} >Show member</Text>
                    </TouchableOpacity>
                    <MemberInfo memberInfo={this.state.currentMember} style={styles.memberInfo} />
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        backgroundColor: 'purple',
        width: 150,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        marginTop: 20,
        alignSelf: 'center'
    },
    txtButton: {
        color: 'white',
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    txtTitle: {
        color: 'black',
        fontWeight: 'bold',
        alignSelf: 'center',
    },
    txtStatus: {
        backgroundColor: '#00ffffff',
        marginTop: 5,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        padding: 5,
        borderRadius: 5
    },
    textInput: {
        borderColor: 'black',
        borderRadius: 1,
        backgroundColor: 'gray',
        marginHorizontal: 5,
        borderRadius: 5
    },
    memberInfo: {
        marginTop: 5,
        width: '90%',
        alignSelf: 'center'
    }
});
