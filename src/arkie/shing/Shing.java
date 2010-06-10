package arkie.shing;

import android.app.Activity;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Window;
import android.widget.TextView;

import arkie.sprockets.*;

public class Shing extends Activity
{
	@Override
	public void onCreate(Bundle savedInstanceState)
	{
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
//		Typeface uni = Typeface.createFromAsset(
//				getAssets(), "fonts/alterebro-pixel-font.ttf");
		setContentView(new SpriteView(this));
	}
}
