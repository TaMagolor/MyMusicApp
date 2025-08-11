import sys
import json
import librosa
import numpy as np

def find_best_loop_points(file_path, min_loop_duration=10.0):
    """
    音楽ファイルを解析し、最適なループ区間を検出する。

    Args:
        file_path (str): 解析対象の音楽ファイルへのパス。
        min_loop_duration (float): 検出するループの最短時間（秒）。

    Returns:
        dict: 成功時はループの開始・終了時間、失敗時はエラーステータスを含む辞書。
    """
    try:
        # 1. 音楽ファイルを読み込み (元のサンプリングレートを維持し、モノラルに変換)
        y, sr = librosa.load(file_path, sr=None, mono=True)
        
        # 曲が短すぎる場合は処理を中断
        if librosa.get_duration(y=y, sr=sr) < min_loop_duration:
            return {"status": "error", "message": "Song is too short to find a loop."}

        # 2. 特徴量（クロマグラム）を抽出
        # 楽曲のハーモニー構造を捉えるのに適している
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)

        # 3. 自己相似性行列を計算 (似ている部分ほど高い値になるように正規化)
        similarity_matrix = librosa.segment.recurrence_matrix(chroma, mode='affinity', sparse=True)

        # 4. 繰り返し区間（対角線）を検出
        lag_matrix = librosa.segment.recurrence_to_lag(similarity_matrix, pad=False)
        
        best_score = 0
        best_start_frame = 0
        best_end_frame = 0

        # 各ラグ（繰り返し周期）をチェック
        for lag in range(1, lag_matrix.shape[1]):
            diag = np.diag(lag_matrix, k=-lag)
            stretches = np.split(diag, np.where(diag == 0)[0] + 1)
            
            for stretch in stretches:
                run_length = len(stretch)
                run_score = np.sum(stretch)

                if run_length > 0 and run_score > best_score:
                    head = np.where(diag == stretch[0])[0][0]
                    loop_duration_sec = librosa.frames_to_time(run_length, sr=sr)
                    
                    if loop_duration_sec >= min_loop_duration:
                        best_score = run_score
                        best_start_frame = head
                        best_end_frame = head + run_length
                        
        if best_score > 0:
            # フレーム数を秒に変換して結果を返す
            start_time = librosa.frames_to_time(best_start_frame, sr=sr)
            end_time = librosa.frames_to_time(best_end_frame, sr=sr)
            
            return {
                "status": "success",
                "startTime": round(start_time, 3),
                "endTime": round(end_time, 3)
            }
        else:
            return {"status": "error", "message": "Could not find a suitable loop."}

    except Exception as e:
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    # コマンドラインからファイルパスを受け取る
    if len(sys.argv) > 1:
        input_file_path = sys.argv[1]
        result = find_best_loop_points(input_file_path)
    else:
        result = {"status": "error", "message": "No file path provided."}
    
    # 結果をJSON形式で標準出力に出力する
    print(json.dumps(result))