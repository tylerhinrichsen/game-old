








// Has To Resolve....

export function functionAsync() {
    return new Promise((resolve) => {
        // Do Shit & resolve

        resolve(true)
    })
  }


export async function funcWissa() {
    const a = await functionAsync()
  }


const b = await funcWissa()
