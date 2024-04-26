import { useEffect, useRef, useState } from 'react';

const View = () => {
  const editorRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [content, setContent] = useState("");

  useEffect(() => {
    if (typeof window === 'undefined' || !editorRef.current) return;

    import('@editorjs/editorjs').then(({ default: EditorJS }) => {
      const editor = new EditorJS({
        holder: editorRef.current,
        tools: {
          header: {
            class: require('@editorjs/header')
          },
         
          list: {
            class: require('@editorjs/list')
          },
            table: {
            class: require('@editorjs/table')
          },
        },
        // Your editor configuration options
      });
      setEditorInstance(editor);
    });

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    };
  }, []);

  const handleChange = (event) => {
    setContent(event.target.value);
  };

  const handleSave = async () => {
    if (editorInstance) {
      try {
        const savedContent = await editorInstance.save();
        console.log("Editor content:", savedContent);
      } catch (error) {
        console.error("Failed to save editor content:", error);
      }
    }
  };

  return (
    <div className="panel mb-5 p-5 h-52">
      <div ref={editorRef} className="border border-gray-200 mb-5"></div>
      <button onClick={handleSave} className="btn btn-primary">Save</button>
    </div>
  );
}

export default View;
