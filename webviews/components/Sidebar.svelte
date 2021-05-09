<script lang="ts">
  import { onMount } from "svelte";
import type { User } from "../types";

  import HelloWorld from "./HelloWorld.svelte";
import Todos from "./Todos.svelte";

  let todos: Array<{ text: string; completed: boolean }> = [];
  let count = 0;
  let accessToken = "";
  let text = "";
  //let user: { name: string; id: number } | null = null;
   let user: User | null = null;
  let loading = true;
  onMount(async () => {
    window.addEventListener("message", async (event) => {
      const message = event.data;
      console.log({ message }); // The json data that the extension sent
      switch (message.type) {
        /* case "new-todo":
          todos = [{ text: message.value, completed: false }, ...todos];
          break; */
        case "token":
          accessToken = message.value;
          const response = await fetch(`${apiBaseUrl}/me`, {
            headers: {
              authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          user = data.user;
          loading = false;
      }
    });
    tsvscode.postMessage({ type: "get-token", value: undefined });
  });
</script>

<!-- <div>{count}</div>
<div>Text: {text}</div> -->
{#if loading}
  <div>loading.....</div>
{:else if user}
  <pre>{JSON.stringify(user,null,2)}</pre>
  <Todos {user}></Todos>
  <button on:click={()=>{
accessToken='';
user=null;
 tsvscode.postMessage({ type: "logout", value: undefined });


  }}>logout</button>
{:else}
<button on:click={()=>{

    tsvscode.postMessage({ type: "authenticate", value: undefined });

  }}>login with github</button>

  <!-- <div>no user is logged in</div> -->
{/if}


<!-- <button on:click={()=>{
  count++;
}


}>Increment</button>
<button on:click={()=>{
  text= '';
}}>Reset</button> -->
