const bcrypt = require("bcrypt");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
async function seed(knex) {
  const demoPassword = await bcrypt.hash(
    process.env.DEMO_ACCOUNT_PASSWORD || "DemoAccount123!",
    12
  );

  let alexImage = await knex("images")
    .where({ public_id: "demo_alex_avatar" })
    .first();

  if (!alexImage) {
    const [createdImage] = await knex("images")
      .insert({
        image: "/assets/demo-alex.png",
        public_id: "demo_alex_avatar",
      })
      .returning("id");

    alexImage = {
      id:
        typeof createdImage === "object"
          ? createdImage.id
          : createdImage,
    };
  }

  let sarahImage = await knex("images")
    .where({ public_id: "demo_sarah_avatar" })
    .first();

  if (!sarahImage) {
    const [createdImage] = await knex("images")
      .insert({
        image: "/assets/demo-sarah.png",
        public_id: "demo_sarah_avatar",
      })
      .returning("id");

    sarahImage = {
      id:
        typeof createdImage === "object"
          ? createdImage.id
          : createdImage,
    };
  }

  if (!alexImage?.id || !sarahImage?.id) {
    throw new Error("Demo images could not be created.");
  }

  // Create or update Alex
  await knex("users")
    .insert({
      firstName: "Alex",
      lastName: "Morgan",
      username: "demo_alex",
      email: "demo.alex@connectapp.dev",
      bio: "Demo account for exploring Connect.",
      password: demoPassword,
      image_id: 1,
      is_demo: true,
      demo_key: "alex",
    })
    .onConflict("email")
    .merge({
      firstName: "Alex",
      lastName: "Morgan",
      username: "demo_alex",
      bio: "Demo account for exploring Connect.",
      password: demoPassword,
      image_id: 1,
      is_demo: true,
      demo_key: "alex",
    });

  // Create or update Sarah
  await knex("users")
    .insert({
      firstName: "Sarah",
      lastName: "Johnson",
      username: "demo_sarah",
      email: "demo.sarah@connectapp.dev",
      bio: "Demo account for testing real-time messaging.",
      password: demoPassword,
      image_id: 1,
      is_demo: true,
      demo_key: "sarah",
    })
    .onConflict("email")
    .merge({
      firstName: "Sarah",
      lastName: "Johnson",
      username: "demo_sarah",
      bio: "Demo account for testing real-time messaging.",
      password: demoPassword,
      image_id: 1,
      is_demo: true,
      demo_key: "sarah",
    });

  const alex = await knex("users")
    .where({
      email: "demo.alex@connectapp.dev",
    })
    .first();

  const sarah = await knex("users")
    .where({
      email: "demo.sarah@connectapp.dev",
    })
    .first();

  if (!alex || !sarah) {
    throw new Error(
      "Demo users could not be found after insertion."
    );
  }

  await knex("friends")
    .where({
      user_id: alex.id,
      friend_id: sarah.id,
    })
    .orWhere({
      user_id: sarah.id,
      friend_id: alex.id,
    })
    .del();

  await knex("friends").insert([
    {
      user_id: alex.id,
      friend_id: sarah.id,
    }
  ]);

  console.log("Demo users and friendship created successfully.");
}

module.exports = {
  seed,
};