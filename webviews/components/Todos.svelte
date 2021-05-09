<script lang="ts">
import { onMount } from "svelte";
import type { User } from "../types";

export let user:User;
    let text="";

  let todos: Array<{ text: string; completed: boolean }> = [];
    onMount(async () => {
    window.addEventListener("message", async (event) => {
      const message = event.data;
      console.log({ message }); // The json data that the extension sent
      switch (message.type) {
        case "new-todo":
          todos = [{ text: message.value, completed: false }, ...todos];
          break;
       /*  case "token":
          accessToken = message.value;
          const response = await fetch(`${apiBaseUrl}/me`, {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          user = data.user;
          loading = false; */
      }
    });
   // tsvscode.postMessage({ type: "get-token", value: undefined });
  });
</script>
<style>
  /* div {
    color: aqua;
  } */

  .complete {
    text-decoration: line-through;
  }
</style>
<div> hello: {user.name}</div>
<form
  on:submit|preventDefault={() => {
    todos = [{ text, completed: false }, ...todos];
    text = "";
  }}
>
  <input bind:value={text} />
</form>
<!-- <pre> {JSON.stringify(todos, null, 2)}</pre> -->
<ul>
  <!-- todo.text is the unique id or a key here -->
  {#each todos as todo (todo.text)}
    <li
      class={todo.completed ? "complete" : ""}
      on:click={() => {
        todo.completed = !todo.completed;
      }}
    >
      {todo.text}
    </li>
  {/each}
</ul>
<!-- <button
  on:click={() => {
    tsvscode.postMessage({
      type: "onInfo",
      value: "info message",
    });
  }}>Info button</button
>
<button
  on:click={() => {
    tsvscode.postMessage({
      type: "onError",
      value: "error message",
    });
  }}>error button</button
> -->