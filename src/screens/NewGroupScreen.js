import React, { useState, useEffect } from "react";
import { FlatList, View, TextInput, StyleSheet, Button } from "react-native";
import ContactListItem from "../components/ContactListItem";
import { API, graphqlOperation, Auth } from "aws-amplify";
import { listUsers } from "../graphql/queries";
import { createChatRoom, createUserChatRoom } from "../graphql/mutations";

import { useNavigation } from "@react-navigation/native";

const ContactsScreen = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [name, setName] = useState("");

  const navigation = useNavigation();

  useEffect(() => {
    API.graphql(graphqlOperation(listUsers)).then((result) => {
      setUsers(result.data?.listUsers?.items);
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          title="Create"
          disabled={!name || selectedUserIds.length < 1}
          onPress={onCreateGroupPress}
        />
      ),
    });
  }, [name, selectedUserIds]);

  const onCreateGroupPress = async () => {
    // Create a new Chatroom
    const newChatRoomData = await API.graphql(
      graphqlOperation(createChatRoom, { input: { name } })
    );
    if (!newChatRoomData.data?.createChatRoom) {
      console.log("Error creating the chat room");
      return; // Exit function early if chat room creation failed
    }
  
    const newChatRoom = newChatRoomData.data.createChatRoom;
    console.log("chatroomid: " + newChatRoom.id);
  
    // Add the auth user to the ChatRoom
    const authUser = await Auth.currentAuthenticatedUser();
    console.log("did i get to auth?: " + authUser.attributes.sub);
    await API.graphql(
      graphqlOperation(createUserChatRoom, {
        input: {
          chatRoomId: newChatRoom.id,
          userId: authUser.attributes.sub,
        },
      })
    );
  
    // Add the selected users to the ChatRoom
    //////////////////////////
    console.log("it got to this point 1st");
    selectedUserIds.map((useride) => console.log("userstuff: " + useride));
    console.log("it got to this point... 2nd");
    //////////////////////////////
    await Promise.all(
      
      selectedUserIds.map((UserIDD) =>
      
        API.graphql(
          
          graphqlOperation(createUserChatRoom, {
            input: { chatRoomId: newChatRoom.id, userId: UserIDD },
          })
        )
      )
    );
  
    setSelectedUserIds([]);
    setName("");
    // navigate to the newly created ChatRoom
    navigation.navigate("Chat", { id: newChatRoom.id });
  };

  const onContactPress = (id) => {
    setSelectedUserIds((userIds) => {
      if (userIds.includes(id)) {
        // remove id from selected
        return [...userIds].filter((uid) => uid !== id);
      } else {
        // add id to selected
        return [...userIds, id];
      }
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Group name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <FlatList
        data={users}
        renderItem={({ item }) => (
          <ContactListItem
            user={item}
            selectable
            onPress={() => onContactPress(item.id)}
            isSelected={selectedUserIds.includes(item.id)}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "white" },
  input: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "lightgray",
    padding: 10,
    margin: 10,
  },
});

export default ContactsScreen;