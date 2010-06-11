package arkie.shing;

import android.app.Activity;
import android.os.Bundle;
import android.view.Window;

import arkie.sprockets.*;

public class Shing extends Activity {
	@Override public void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(new SpriteView(this, new SpriteMap()));
	}
}
