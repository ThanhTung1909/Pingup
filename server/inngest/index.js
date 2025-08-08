import { Inngest } from "inngest";
import User from "../models/User";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "pingup-app" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { envent: "clerk/user.created" },
  async ({ envent }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      envent.data;
    let username = email_addresses[0].email_address.split("@")[0];

    // Check availability of username
    const user = await User.findOne({ username });

    if (user) {
      username = username + Math.floor(Math.random() * 10000);
    }
    const userData = {
      _id: id,
      email: email_addresses[0].email_address,
      full_name: first_name + "" + last_name,
      profile_picture: image_url,
      username,
    };
    await User.create(userData);
  }
);

// Inngest Function to update user data to a database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { envent: "clerk/user.updated" },
  async ({ envent }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      envent.data;

    const updateUserData = {
      email: email_addresses[0].email_address,
      full_name: first_name + "" + last_name,
      profile_picture: image_url,
    };

    await User.findByIdAndUpdate(id, updateUserData);
  }
);
// Inngest Function to update user data to a database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { envent: "clerk/user.deleted" },
  async ({ envent }) => {
    const { id } = envent.data;

    await User.findByIdAndDelete(id);
  }
);
// Create an empty array where we'll export future Inngest functions
export const functions = [syncUserCreation, syncUserUpdation, syncUserDeletion];
