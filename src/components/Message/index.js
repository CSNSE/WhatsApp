import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useWindowDimensions, Image } from "react-native";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Auth, Storage } from "aws-amplify";

dayjs.extend(relativeTime);

const Message = ({ message }) => {
  const [isMe, setIsMe] = useState(false);
  const [downloadAttachments, setDownloadAttachments] = useState([]);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const authUser = await Auth.currentAuthenticatedUser();
        setIsMe(message.userID === authUser.attributes.sub);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [message.userID]);

  useEffect(() => {
    const downloadAttachments = async () => {
      try {
        if (message.Attachments && message.Attachments.items) {
          const downloadedAttachments = await Promise.all(
            message.Attachments.items.map(async (attachment) => {
              const uri = await Storage.get(attachment.storageKey);
              return { ...attachment, uri };
            })
          );
          setDownloadAttachments(downloadedAttachments);
        }
      } catch (error) {
        console.error("Error downloading attachments:", error);
      }
    };

    downloadAttachments();
  }, [message.Attachments]);

  const renderAttachments = () => {
    return downloadAttachments.map((attachment, index) => (
      <Image key={index} source={{ uri: attachment.uri }} style={styles.image} />
    ));
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isMe ? "#DCF8C5" : "white", alignSelf: isMe ? "flex-end" : "flex-start" },
      ]}
    >
      {renderAttachments()}
      <Text>{message.text}</Text>
      <Text style={styles.time}>{dayjs(message.createdAt).fromNow(true)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 5,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  time: { color: "gray", alignSelf: "flex-end" },
  image: { width: 100, height: 100, borderRadius: 5, marginBottom: 5 },
});

export default Message;
