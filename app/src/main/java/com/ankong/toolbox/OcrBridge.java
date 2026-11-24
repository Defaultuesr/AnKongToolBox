package com.ankong.toolbox;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.google.android.gms.tasks.Tasks;
import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.text.Text;
import com.google.mlkit.vision.text.TextRecognition;
import com.google.mlkit.vision.text.TextRecognizer;
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions;

import java.util.concurrent.TimeUnit;

/**
 * 本地 OCR 引擎桥接（v1.9：真机 ML Kit bundled 中文识别）。
 *
 * 采用 Google ML Kit 的 on-device bundled 中文模型：模型与识别引擎随 APK 打包，
 * 全程在本机解码与识别，图片不上传、不写入外部存储、不经过任何服务器。
 * 无需 Google Play 服务、无需联网、无需任何 API Key。
 *
 * available() 报告引擎是否已随本包集成；recognize() 同步识别并在 20 秒超时后返回。
 */
public final class OcrBridge {

    private OcrBridge() {}

    private static volatile TextRecognizer recognizer = null;

    /** bundled 模型已随 APK 打包，始终可用。 */
    public static boolean available() {
        try {
            Class.forName("com.google.mlkit.vision.text.TextRecognition");
            Class.forName("com.google.mlkit.vision.common.InputImage");
            return true;
        } catch (Throwable t) {
            return false;
        }
    }

    private static TextRecognizer getRecognizer() {
        if (recognizer == null) {
            synchronized (OcrBridge.class) {
                if (recognizer == null) {
                    recognizer = TextRecognition.getClient(
                            new ChineseTextRecognizerOptions.Builder().build());
                }
            }
        }
        return recognizer;
    }

    /** 返回识别出的文本；引擎不可用或识别失败时返回 null。 */
    public static String recognize(String dataUrl) {
        if (!available() || dataUrl == null) return null;
        try {
            int comma = dataUrl.indexOf(',');
            if (comma < 0) return null;
            byte[] bytes = Base64.decode(dataUrl.substring(comma + 1), Base64.DEFAULT);
            Bitmap bm = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
            if (bm == null) return null;

            InputImage image = InputImage.fromBitmap(bm, 0);
            Text result = Tasks.await(getRecognizer().process(image), 20, TimeUnit.SECONDS);
            String text = result == null ? null : result.getText();
            bm.recycle();
            return text == null ? "" : text;
        } catch (Throwable t) {
            return null;
        }
    }
}
