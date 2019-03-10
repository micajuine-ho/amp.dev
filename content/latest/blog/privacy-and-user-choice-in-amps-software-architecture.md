---
class: post-blog post-detail
type: Blog
$title: "Privacy and user choice in AMP’s software architecture"
id: privacy-and-user-choice-in-amps-software-architecture
author: Malte Ubl
role:  Tech Lead of the AMP Project.
origin: "https://amphtml.wordpress.com/2018/07/23/privacy-and-user-choice-in-amps-software-architecture/amp/"
excerpt: "Early choices in designing the AMP HTML JavaScript library have made it uniquely suited for publishers to implement effective privacy controls for users. In web pages, resource requests and browser storage access that may have privacy impact can be initiated through a multitude of mechanisms, many of which are often controlled by third parties. This [&#8230;]"
avatar: https://1.gravatar.com/avatar/42ecb1ea497ca9d0ffe1e406cae70e27?s=96&d=identicon&r=G
date_data: 2018-07-23T10:36:25-07:00
$date: July 23, 2018
$parent: /content/latest/list-blog.html
$path: /latest/blog/{base}/
$localization:
  path: /{locale}/latest/blog/{base}/
components:
  - social-share
inlineCSS: .amp-wp-inline-329fdb7771c10d07df9eb73273c95a60{font-weight:400;}
---

<div class="amp-wp-article-content">

		<p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Early choices in designing the AMP HTML JavaScript library have made it uniquely suited for publishers to implement effective privacy controls for users. In web pages, resource requests and browser storage access that may have privacy impact can be initiated through a multitude of mechanisms, many of which are often controlled by third parties. This may make it hard for a publisher to ensure that no unintended actions are performed before, for example, appropriate user consent is obtained. This post is looking at a software architecture within AMP that may aid publishers to effectively implement such user choice options. For concrete steps to implement user choice flows in AMP documents, please check out this </span><a href="https://www.ampproject.org/latest/blog/new-tools-for-building-user-controls-in-amp-pages/"><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">blog post</span></a><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">.</span></p><h2><b>Privacy-preserving prerendering</b></h2><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">One of the key ways how AMP differentiates itself from general HTML documents is that it has the capability of privacy-preserving prerendering built-in. This is a user privacy requirement to implement instant loading of documents.</span></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Instant loading naturally requires loading a document that a user might see </span><i><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">before</span></i><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60"> the user has navigated to it. By loading it before the user expressed intent, network operations can be executed by the time user finally does express intent (e.g. by clicking a link), making the load time much faster.</span></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Instant loading is clearly a great user experience, but it does come with a privacy challenge. If a user never ends up looking at a document that was prerendered, then the publisher might still receive signals and information about the user through the pre-rendering of the document. This is a change from how the web usually works, and may not be what users expect. For this reason, we designed AMP such that it would </span><b>not</b><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60"> allow a publisher of a document to know that pre-rendering of a web page is happening until the user expresses intent to actually go to the web page. This is what we call privacy-preserving prerendering.</span></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Privacy-preserving prerendering is implemented in AMP via 2 primary mechanisms that work together:</span></p><ol><li class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60"><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">A platform-controlled AMP Cache that does not expose user request data to a publisher of content.</span></li>
<li class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60"><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">A centralized request manager that controls the timing and availability of resource requests from web components on AMP pages.</span></li>
</ol><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Let’s look a bit closer at the second mechanism: Whenever an AMP page loads any resource, such as images, videos, ads, analytics requests, tweets, or any of dozens of other types of resources, the associated network requests are controlled by a central resource management mechanism. This resource manager, in addition to performing many other functions, also ensures that requests that are not allowed during the prerendering phase of a document lifecycle are held back until the document learns that the user expressed intent to see the page.</span></p><p><amp-img class="alignnone size-full wp-image-2111 amp-wp-enforced-sizes" src="https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-e1532367183277.png?w=660" alt="privacy-and-user-choice-in-amp_s-software-architecture-blog-post-e1532367137299.png" srcset="https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-e1532367183277.png 344w, https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-e1532367183277.png?w=141 141w, https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-e1532367183277.png?w=281 281w" sizes="(min-width: 344px) 344px, 100vw" width="344" height="367"></amp-img><br/><i><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Diagram of the process to load a resource in the AMP JS library.</span></i></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">This is the key architectural feature of AMP that makes it uniquely suited to implement more sophisticated privacy controls on top of this baseline mechanism.</span></p><h2><b>An architecture for supporting user choice</b></h2><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">The previous paragraph talks about how AMP controls resource request timing to ensure that certain requests made during the prerendering phase are only actually made after a user has expressed intent to visit a page. From a software architecture point of view, this introduces a central mechanism to control request timing, making it relatively easy to then introduce additional rules, including rules specified by the publisher of the page, for delaying requests on top of the pre-rendering specific rules. </span></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">For example, one such publisher-specified rule could be to delay any ad requests on an AMP page until the publisher has obtained sufficient user consent to make such ad requests or share ads-related data with an ad vendor. </span></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">For each AMP web component (such as the </span><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">amp-ad</span><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60"> and the </span><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">amp-img</span><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60"> elements), a publisher can specify that the associated resources should only be loaded if the user has provided consent that the publisher has determined is needed to load and display the respective resource.</span></p><p><amp-img class="alignnone size-full wp-image-2112 amp-wp-enforced-sizes" src="https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-1-e1532367237552.png?w=660" alt="privacy-and-user-choice-in-amp_s-software-architecture-blog-post-1.png" srcset="https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-1-e1532367237552.png 619w, https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-1-e1532367237552.png?w=145 145w, https://amphtml.files.wordpress.com/2018/07/privacy-and-user-choice-in-amp_s-software-architecture-blog-post-1-e1532367237552.png?w=291 291w" sizes="(min-width: 619px) 619px, 100vw" width="619" height="639"></amp-img><br/><i><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Diagram of the process that determines the flow to requesting a resource in the AMP JS library. </span></i></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">While a publisher may still need to perform an audit of the types of AMP web components they load on their page and determine whether any form of user consent may be needed to display them, having a unified mechanism to control the behavior of all resource types that may be included in a page–from images, over ads, to analytics–should make it easier for a publisher to gain confidence that they applied the consent treatment to the full spectrum of resources and behaviors where it is needed.</span></p><p><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">This post looked at privacy-enhancing functionality from a software architecture point of view. For concrete steps to implement user choice flows in AMP documents, please check out this </span><a href="https://www.ampproject.org/latest/blog/new-tools-for-building-user-controls-in-amp-pages/"><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">blog post</span></a><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">.</span></p><p><i><span class="amp-wp-inline-329fdb7771c10d07df9eb73273c95a60">Posted by <a href="https://twitter.com/cramforce">Malte Ubl</a>, Tech Lead of the AMP Project.</span></i></p>	</div>

	

</div>
