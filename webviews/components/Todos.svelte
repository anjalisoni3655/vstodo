<script lang="ts">
import { onMount } from "svelte";
import type { User } from "../types";

export let user:User;
export let accessToken: string;
    let text="";

  let todos: Array<{ text: string; completed: boolean;id:number }> = [];

   async function addTodo(t: string) {
        const response = await fetch(`${apiBaseUrl}/todo`, {
            method: "POST",
            body: JSON.stringify({
                text: t,
            }),
            headers: {
                "content-type": "application/json",
                authorization: `Bearer ${accessToken}`,
            },
        });
        const { todo } = await response.json();
        todos = [todo, ...todos];
    }

    onMount(async () => {
    window.addEventListener("message", async (event) => {
      const message = event.data;
      console.log({ message }); // The json data that the extension sent
      switch (message.type) {
        case "new-todo":
            addTodo(message.value);
            /*  const response = await fetch(`${apiBaseUrl}/todo`, {
                 method:"POST",
                 body:JSON.stringify({
                     text:message.value,
                 }),
            headers: {
                "content-type":"application/json",
                authorization: `Bearer ${accessToken}`,
            },
        });
        const {todo}= await response.json();
        todos = [todo, ...todos]; */
       //   todos = [{ text: message.value, completed: false , id :1}, ...todos];
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
    const response = await fetch(`${apiBaseUrl}/todo`, {
            headers: {
               authorization: `Bearer ${accessToken}`,
            },
        });
        const payload = await response.json();
        todos = payload.todos;
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
  on:submit|preventDefault={async() => {
   // todos = [{ text, completed: false }, ...todos];
   addTodo(text);
  /*   const response = await fetch(`${apiBaseUrl}/todo`),{
        method:'POST',
        body:JSON.stringify({
text,

        }),
        headers:{
            'content-type':'application/json'
    authorization:`Bearer ${accessToken}`,

},
    }); 
    const {todo}= await response.json();
     todos = [todo, ...todos]; */
    text = "";
  }}
>
  <input bind:value={text} />
</form>
<!-- <pre> {JSON.stringify(todos, null, 2)}</pre> -->
<ul>
  <!-- todo.text is the unique id or a key here -->
  {#each todos as todo (todo.id)}
    <li
      class={todo.completed ? "complete" : ""}
      on:click={async() => {
        todo.completed = !todo.completed;
        const response = await fetch(`${apiBaseUrl}/todo`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        id: todo.id,
                    }),
                    headers: {
                        'content-type': 'application/json',
                        authorization: `Bearer ${accessToken}`,
                    },
                });
                console.log(await response.json());
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