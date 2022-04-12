import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@toast-ui/react-editor';
import { useMutation, useQueryClient } from 'react-query';

import * as boardAPI from 'api/board';
import StyledInput from 'components/common/StyledInput';

const BoardEditor = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(null);
  const queryClient = useQueryClient();

  const editor = useRef(null);

  const changeTitle = (e) => {
    setTitle(e.target.value);
  };

  const wrtieBoard = useMutation(boardAPI.write, {
    mutationKey: ['boards'],
    onSuccess: (data) => {
      queryClient.invalidateQueries(['boards']);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.current.getInstance().removeHook('addImageBlobHook');
    editor.current
      .getInstance()
      .addHook('addImageBlobHook', async (blob, callback) => {
        const formData = new FormData();
        formData.append('image', blob);

        const res = await boardAPI.uploadImg(formData);

        callback(res.data.imgUrl, 'image');
      });
  }, [editor]);

  const onClick = () => {
    const contents = editor.current.getInstance().getHTML();
    const payload = {
      title,
      contents,
    };
    console.log(payload);
    wrtieBoard.mutate(payload);
    navigate('/board?sort=recent&page=1');
  };
  return (
    <BoardEditorWrapper>
      <Input
        id="boardTitle"
        type="text"
        placeholder="제목을 입력하세요."
        onChange={changeTitle}
      />
      <div className="editor-wrapper">
        <Editor
          className="editor"
          height="500px"
          previewStyle={false}
          toolbarItems={[
            ['heading', 'bold', 'italic', 'strike'],
            ['hr', 'quote'],
            ['ul', 'ol', 'indent', 'outdent'],
            ['table', 'image', 'link'],
          ]}
          previewHighlight={false}
          initialEditType="wysiwyg"
          placeholder="여러분의 이야기를 자유롭게 적으세요."
          ref={editor}
        />
      </div>
      <ButtonWrapper>
        <button onClick={onClick} className="upload-btn">
          업로드
        </button>
        <button className="cancle-btn">취소</button>
      </ButtonWrapper>
    </BoardEditorWrapper>
  );
};

const BoardEditorWrapper = styled.section`
  padding: 2rem 0;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 3rem;
  .editor-wrapper {
    width: 100%;
  }

  .toastui-editor-defaultUI {
    width: 100%;
  }

  .toastui-editor-dropdown-toolbar {
    right: -2.1rem !important;
  }
  .toastui-editor-popup {
    left: 50% !important;
  }
  .toastui-editor-popup-add-table {
    left: 25rem !important;
  }
`;

const Input = styled(StyledInput)`
  border: none;
  background-color: inherit;
  border-bottom: 1px solid #ccc;
  border-radius: 0;
`;

const ButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 2rem;

  > button {
    width: 5rem;
    font-size: 1.3rem;
    margin-right: 0.5rem;
    padding: 1rem 0;
    color: #fff;
    border-radius: 0.5rem;
    transition: 0.2s background-color;
    @media screen and (min-width: 768px) {
      width: 8rem;
      font-size: 1.5rem;
    }
  }

  .upload-btn {
    background-color: #db428e;
    &:hover {
      background-color: #c22d77;
    }
  }
  .cancle-btn {
    background-color: #ccc;
    &:hover {
      background-color: #aaa;
    }
  }
`;

export default BoardEditor;
